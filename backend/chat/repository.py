from datetime import datetime, timezone
from bson import ObjectId


def conversation_key(a, b):
    return "account:" + ":".join(map(str, sorted((a, b))))


class ChatRepository:
    def __init__(self, db):
        self.messages = db.chat_messages

    async def initialize(self):
        await self.messages.create_index([("conversation_key", 1), ("_id", -1)])
        await self.messages.create_index([("recipient_id", 1), ("read", 1)])
        await self.messages.create_index([("sender_id", 1), ("_id", -1)])

    @staticmethod
    def serialize(doc):
        return {"id": str(doc["_id"]), "sender_id": doc["sender_id"],
                "recipient_id": doc["recipient_id"], "text": doc["text"],
                "created_at": doc["created_at"].isoformat(), "read": doc["read"]}

    async def history(self, user, peer, before=None):
        query = {"conversation_key": conversation_key(user, peer)}
        if before:
            query["_id"] = {"$lt": ObjectId(before)}
        docs = await self.messages.find(query).sort("_id", -1).limit(51).to_list()
        return {"messages": [self.serialize(d) for d in reversed(docs[:50])],
                "next_before": str(docs[49]["_id"]) if len(docs) > 50 else None}

    async def insert(self, sender, recipient, text):
        doc = {"conversation_key": conversation_key(sender, recipient),
               "sender_id": sender, "recipient_id": recipient, "text": text,
               "created_at": datetime.now(timezone.utc), "read": False}
        await self.messages.insert_one(doc)
        return self.serialize(doc)

    async def inbox(self, user):
        cursor = await self.messages.aggregate([
            {"$match": {"$or": [{"sender_id": user}, {"recipient_id": user}]}},
            {"$sort": {"_id": -1}},
            {"$group": {"_id": "$conversation_key", "last": {"$first": "$$ROOT"},
                "unread": {"$sum": {"$cond": [{"$and": [{"$eq": ["$recipient_id", user]}, {"$eq": ["$read", False]}]}, 1, 0]}}}},
            {"$sort": {"last._id": -1}},
        ])
        return await cursor.to_list()

    async def mark_read(self, user, peer, through):
        await self.messages.update_many({"recipient_id": user, "sender_id": peer,
            "_id": {"$lte": ObjectId(through)}, "read": False}, {"$set": {"read": True}})

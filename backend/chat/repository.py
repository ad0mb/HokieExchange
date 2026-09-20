from datetime import datetime, timezone
from bson import ObjectId

class ChatRepository:
    def __init__(self, db):
        self.messages = db.chat_messages

    async def initialize(self):
        await self.messages.create_index([("conversation_key", 1), ("_id", -1)])

    @staticmethod
    def serialize(doc):
        return {
            "id": str(doc["_id"]), "sender_role": doc["sender_role"],
            "student_id": doc["student_id"], "vendor_id": doc["vendor_id"], "text": doc["text"],
            "created_at": doc["created_at"].isoformat(),
        }

    async def history(self, key, before=None):
        query = {"conversation_key": key}
        if before:
            query["_id"] = {"$lt": ObjectId(before)}
        docs = await self.messages.find(query).sort("_id", -1).limit(51).to_list()
        return {"messages": [self.serialize(d) for d in reversed(docs[:50])],
                "next_before": str(docs[49]["_id"]) if len(docs) > 50 else None}

    async def insert(self, pair, key, text):
        doc = {"conversation_key": key, "sender_role": pair.role, "student_id": pair.student_id,
               "vendor_id": pair.vendor_id, "text": text,
               "created_at": datetime.now(timezone.utc)}
        await self.messages.insert_one(doc)
        return self.serialize(doc)

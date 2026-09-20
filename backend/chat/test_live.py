"""Optional real backend/Mongo check using two freshly signed-in accounts.

Set CHAT_TEST_TOKEN_A and CHAT_TEST_TOKEN_B from /api/chat/token in each
account's browser session. Tokens last five minutes. Run python -m chat.test_live.
Creates two messages and deletes only those exact IDs after the test.
"""
import asyncio
import os
import socketio
import httpx
from bson import ObjectId
from pymongo import AsyncMongoClient
from dotenv import load_dotenv


async def main():
    load_dotenv()
    url = os.getenv("CHAT_TEST_URL", "http://127.0.0.1:8000")
    tokens = [os.environ["CHAT_TEST_TOKEN_A"], os.environ["CHAT_TEST_TOKEN_B"]]
    clients = [socketio.AsyncClient(), socketio.AsyncClient()]
    mongo = AsyncMongoClient(os.environ["MONGODB_URI"])
    collection = mongo.get_default_database().chat_messages
    ids = []
    events = [[], []]
    try:
        async with httpx.AsyncClient(base_url=url) as http:
            users = []
            for i, value in enumerate(tokens):
                response = await http.post("/auth/me", headers={"Authorization": f"Bearer {value}"})
                response.raise_for_status()
                users.append(response.json()["studentId"])
                async def received(message, index=i):
                    events[index].append(message)
                clients[i].on("message_received", received)
                await clients[i].connect(url, auth={"token": value}, transports=["websocket"])
            assert users[0] != users[1], "Use two different Google accounts."
            for index in (0, 1):
                reply = await clients[index].call("send_message", {"recipient_id": users[1-index], "text": "Live integration test"})
                assert reply["ok"], reply
                ids.append(ObjectId(reply["message"]["id"]))
            for _ in range(100):
                if all(len(e) >= 2 for e in events):
                    break
                await asyncio.sleep(.05)
            assert all(len(e) >= 2 for e in events), "Live broadcast missing"
            assert await collection.count_documents({"_id": {"$in": ids}}) == 2
            response = await http.get(f"/chat/users/{users[1]}/messages", headers={"Authorization": f"Bearer {tokens[0]}"})
            response.raise_for_status()
            assert set(map(str, ids)).issubset({m["id"] for m in response.json()["messages"]})
            assert (await http.get("/chat/inbox")).status_code in (401, 403)
            print("PASS: authenticated two-way live delivery, persisted history, unauthenticated access rejected")
    finally:
        for client in clients:
            if client.connected:
                await client.disconnect()
        if ids:
            await collection.delete_many({"_id": {"$in": ids}})
        await mongo.close()


if __name__ == "__main__":
    asyncio.run(main())

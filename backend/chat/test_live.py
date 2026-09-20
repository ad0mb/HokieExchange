"""Real HTTP + Socket.IO + MongoDB test. Removes only this test's messages."""
import asyncio
import os
import secrets
import socketio
import httpx
from pymongo import AsyncMongoClient
from bson import ObjectId


async def main():
    url = os.getenv("CHAT_TEST_URL", "http://127.0.0.1:8000")
    a = secrets.randbelow(100000000) + 1000000000
    b, c = a + 1, a + 2
    clients = [socketio.AsyncClient() for _ in range(3)]
    received = [[], [], []]
    mongo = AsyncMongoClient(os.environ["MONGODB_URI"])
    collection = mongo.get_default_database().chat_messages
    ids = []
    try:
        for i, (user, other) in enumerate([(a,b), (a,b), (c,b)]):
            async def on_message(data, index=i):
                received[index].append(data)
            clients[i].on("message_received", on_message)
            await clients[i].connect(url, auth={"student_id":user, "vendor_id":other, "role":"vendor" if i == 1 else "student"}, transports=["websocket"])
        async with httpx.AsyncClient() as http:
            empty = await http.get(f"{url}/chat/vendors/{b}/messages", params={"student_id":a})
            assert empty.status_code == 200 and empty.json()["messages"] == []
            invalid = await clients[0].call("send_message", {"text":"   "})
            assert not invalid["ok"]
            for index in (0,1):
                reply = await clients[index].call("send_message", {"text":f"Integration test {index}"})
                assert reply["ok"]
                ids.append(ObjectId(reply["message"]["id"]))
            for _ in range(40):
                if len(received[0]) == 2 and len(received[1]) == 2:
                    break
                await asyncio.sleep(.05)
            assert len(received[0]) == len(received[1]) == 2
            assert received[2] == [], "Unrelated conversation received messages"
            await clients[1].disconnect()
            history = (await http.get(f"{url}/chat/vendors/{b}/messages", params={"student_id":a})).json()
            assert len(history["messages"]) == 2
            assert await collection.count_documents({"_id":{"$in":ids}}) == 2
            await clients[1].connect(url, auth={"student_id":a,"vendor_id":b,"role":"vendor"}, transports=["websocket"])
            again = (await http.get(f"{url}/chat/vendors/{b}/messages", params={"student_id":a})).json()
            assert history == again
            bad = await http.get(f"{url}/chat/vendors/{b}/messages", params={"student_id":a,"before":"invalid"})
            assert bad.status_code == 422
        print("PASS: empty history, two-way sockets, validation, pair isolation, Mongo persistence and reconnect history")
    finally:
        for client in clients:
            if client.connected:
                await client.disconnect()
        if ids:
            await collection.delete_many({"_id":{"$in":ids}})
        await mongo.close()


if __name__ == "__main__":
    asyncio.run(main())

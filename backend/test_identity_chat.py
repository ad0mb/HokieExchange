"""Isolated tests: no Google login, live database, or real messages required."""
import os
import time
import unittest
from unittest.mock import AsyncMock, patch

import jwt
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text, select
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

import main
from database import get_db
from identity.models import GoogleIdentity
from students.models import Student
from chat import transport
from chat.repository import ChatRepository

SECRET = "test-only-secret-not-for-deployment-123456789"


def token(sub="alice", **changes):
    payload = {"sub": sub, "email": f"{sub}@example.com", "email_verified": True,
               "given_name": sub, "family_name": "Test", "iss": "hokie-frontend",
               "aud": "hokie-backend", "iat": int(time.time()), "exp": int(time.time()) + 300}
    payload.update(changes)
    return jwt.encode(payload, SECRET, algorithm="HS256")


class IdentityTests(unittest.TestCase):
    def setUp(self):
        self.env = patch.dict(os.environ, {"CHAT_AUTH_SECRET": SECRET})
        self.env.start()
        self.engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
        with self.engine.begin() as c:
            c.execute(text("CREATE TABLE students (student_id INTEGER PRIMARY KEY AUTOINCREMENT, first_name TEXT NOT NULL, last_name TEXT NOT NULL, graduation_year INTEGER NULL, sso_id INTEGER, email TEXT NULL, date_created DATETIME DEFAULT CURRENT_TIMESTAMP, date_updated DATETIME DEFAULT CURRENT_TIMESTAMP)"))
            c.execute(text("CREATE TABLE vendors (vendor_id INTEGER PRIMARY KEY AUTOINCREMENT, student_id INTEGER NOT NULL, description TEXT NOT NULL, date_created DATETIME DEFAULT CURRENT_TIMESTAMP, date_updated DATETIME DEFAULT CURRENT_TIMESTAMP)"))
        GoogleIdentity.__table__.create(self.engine)
        def session():
            with Session(self.engine) as db:
                yield db
        main.app.other_asgi_app.dependency_overrides[get_db] = session
        self.client = TestClient(main.app)

    def tearDown(self):
        main.app.other_asgi_app.dependency_overrides.clear()
        self.client.close()
        self.engine.dispose()
        self.env.stop()

    def headers(self, sub="alice", **changes):
        return {"Authorization": "Bearer " + token(sub, **changes)}

    def test_account_creation_repeat_login_and_vendor(self):
        first = self.client.post("/auth/me", headers=self.headers())
        self.assertEqual(first.status_code, 200, first.text)
        self.assertIsNone(first.json()["vendorId"])
        again = self.client.post("/auth/me", headers=self.headers())
        self.assertEqual(first.json(), again.json())
        with Session(self.engine) as db:
            self.assertIsNone(db.scalar(select(Student)).graduation_year)
        vendor = self.client.post("/auth/vendor", headers=self.headers()).json()
        self.assertIsInstance(vendor["vendorId"], int)
        self.assertEqual(vendor, self.client.post("/auth/vendor", headers=self.headers()).json())
        self.assertEqual(first.json()["studentId"], vendor["studentId"])

    def test_rejects_forged_expired_and_unverified_identity(self):
        self.assertIn(self.client.post("/auth/me").status_code, (401, 403))
        for changes in ({"exp": 1}, {"email_verified": False}, {"aud": "wrong"}):
            self.assertEqual(self.client.post("/auth/me", headers=self.headers(**changes)).status_code, 401)
        self.assertEqual(self.client.post("/auth/me", headers={"Authorization": "Bearer forged"}).status_code, 401)

    def test_contacts_and_account_ownership(self):
        alice = self.client.post("/auth/me", headers=self.headers()).json()
        bob = self.client.post("/auth/me", headers=self.headers("bob")).json()
        contacts = self.client.get("/chat/contacts", headers=self.headers()).json()
        self.assertEqual([c["studentId"] for c in contacts], [bob["studentId"]])
        response = self.client.patch(f"/students/{bob['studentId']}", headers=self.headers(), json={"first_name": "hijacked"})
        self.assertEqual(response.status_code, 403)
        self.assertEqual(self.client.get(f"/students/{alice['studentId']}").status_code, 200)

    def test_email_cannot_replace_existing_google_identity(self):
        self.client.post("/auth/me", headers=self.headers())
        response = self.client.post("/auth/me", headers=self.headers("different-sub", email="alice@example.com"))
        self.assertEqual(response.status_code, 409)

    def test_verified_email_links_existing_student(self):
        with Session(self.engine) as db:
            db.add(Student(first_name="Existing", last_name="Hokie", graduation_year=2027, email="existing@example.com"))
            db.commit()
            existing_id = db.scalar(select(Student.student_id).where(Student.email == "existing@example.com"))
        result = self.client.post("/auth/me", headers=self.headers("new-sub", email="existing@example.com", given_name="Existing", family_name="Hokie")).json()
        self.assertEqual(result["studentId"], existing_id)
        with Session(self.engine) as db:
            self.assertEqual(len(db.scalars(select(Student)).all()), 1)
            identity = db.get(GoogleIdentity, "new-sub")
            self.assertEqual(identity.student_id, existing_id)


class ChatTests(unittest.IsolatedAsyncioTestCase):
    async def test_socket_sender_is_verified_and_only_participants_receive(self):
        repo = AsyncMock()
        repo.insert.return_value = {"id": "message", "sender_id": 1, "recipient_id": 2}
        with patch.dict(os.environ, {"CHAT_AUTH_SECRET": SECRET}), patch.object(transport, "repository", repo), \
             patch.object(transport.sio, "get_session", AsyncMock(return_value={"student_id": 1, "token": token()})), \
             patch.object(transport, "verify_recipient", return_value=True), \
             patch.object(transport, "authenticated_id", return_value=1), \
             patch.object(transport.sio, "emit", AsyncMock()) as emit:
            result = await transport.send_message("sid", {"recipient_id": 2, "sender_id": 99, "text": " Hello "})
            self.assertTrue(result["ok"])
            repo.insert.assert_awaited_once_with(1, 2, "Hello")
            self.assertEqual([c.kwargs["room"] for c in emit.await_args_list], ["student:1", "student:2"])
            self.assertFalse((await transport.send_message("sid", {"recipient_id": 1, "text": "self"}))["ok"])
            self.assertFalse((await transport.send_message("sid", {"recipient_id": 2, "text": " "}))["ok"])

    async def test_read_receipt_only_updates_incoming_messages_through_cursor(self):
        from bson import ObjectId
        db = type("DB", (), {"chat_messages": AsyncMock()})()
        repo = ChatRepository(db)
        cursor = str(ObjectId())
        await repo.mark_read(1, 2, cursor)
        query, update = db.chat_messages.update_many.await_args.args
        self.assertEqual(query, {"recipient_id": 1, "sender_id": 2, "_id": {"$lte": ObjectId(cursor)}, "read": False})
        self.assertEqual(update, {"$set": {"read": True}})

    async def test_history_uses_authenticated_pair_not_client_sender(self):
        from unittest.mock import MagicMock
        collection = MagicMock()
        collection.find.return_value.sort.return_value.limit.return_value.to_list = AsyncMock(return_value=[])
        repo = ChatRepository(type("DB", (), {"chat_messages": collection})())
        result = await repo.history(3, 2)
        collection.find.assert_called_once_with({"conversation_key": "account:2:3"})
        self.assertEqual(result, {"messages": [], "next_before": None})


if __name__ == "__main__":
    unittest.main()

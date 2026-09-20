# Direct chat

Run one backend worker for this MVP. MongoDB stores one document per message in
chat_messages, indexed by conversation_key and _id. FastAPI owns pair sorting,
validation, history (50 messages per page), persistence, and socket broadcasts.
There is no separate conversation collection.

Set MONGODB_URI to your connection string (including the database name).
Set CHAT_DEMO_MODE=true explicitly for local testing.
Run: uv run uvicorn main:app --reload
Run the frontend with npm run dev and visit /chats.
Use student_id=1 and vendor_id=2 in both tabs. Select Buyer in one tab and Vendor
in the other. IDs are assumed valid; no database lookup is required.

This demo accepts self-selected IDs. It is NOT authenticated private messaging.
Replace the demo identity inputs in HTTP and Socket.IO with verified login
identity before deployment. It is disabled unless CHAT_DEMO_MODE=true.

Optional: CHAT_ORIGINS is a comma-separated list of frontend origins.
Frontend NEXT_PUBLIC_CHAT_API_URL defaults to http://localhost:8000.
Keep MONGODB_URI in the backend environment only.

GET /chat/vendors/{vendor_id}/messages?student_id=1&before=<optional message ID>
returns messages and next_before. Socket.IO authenticates a demo connection with
{student_id, vendor_id, role: "student" | "vendor"}; send_message accepts {text} and acknowledges the saved
message. message_received broadcasts only to the corresponding pair.
On reconnect the UI reloads recent history and merges by message ID.
Failed sends preserve the draft; retries are manual and should follow a history
reload if the acknowledgement timed out.

Keys are student:<student_id>:vendor:<vendor_id>; the namespaces prevent numeric
ID collisions. The sender role comes from the socket session, not the message
payload. ChatIdentity is the replacement point for verified OAuth identity.
Earlier user-to-user demo messages remain stored under their original keys;
they are not mixed into the new student/vendor conversations.

UI structure:
- src/app/chats: independent route
- src/chat/chatui: assembled chat screen
- src/chat/chatsignal: API and socket client
- src/components/chat: reusable MessageList and MessageComposer. These accept
  presentation props/callbacks and have no dependency on MongoDB or Socket.IO.

Run the integration test against a running backend:
uv run python -m chat.test_live
The test uses random demo IDs, creates two test messages, and removes only their
exact message IDs in finally. It needs MONGODB_URI for verification and cleanup.

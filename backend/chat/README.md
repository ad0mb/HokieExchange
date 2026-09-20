# Google accounts and messaging

Google OAuth is handled by the existing Auth.js Google provider in Next.js.
On a verified Google sign-in, the frontend server signs a short-lived assertion
for FastAPI. The backend maps the Google subject to a MySQL student record.
The browser never chooses its sender ID. A vendor is created for that student
when they submit a listing; `/auth/vendor` is idempotent. Session `studentId`
and `vendorId` expose the linked IDs, and the chat provider refreshes them.

All users share one inbox keyed by student ID, including sellers. MongoDB stores
messages in `chat_messages`. Only the sender and recipient receive broadcasts. Read state is persisted and
updated only for messages up to the last loaded message in a focused chat.
Unread counts appear in red on the navbar and conversation list. Reconnecting
refreshes history and unread counts. Run **one backend worker** for this MVP.

## Setup

1. Copy `backend/.env.example` to `backend/.env`. Set `DATABASE_URL`,
   `MONGODB_URI` (include the database name), `CHAT_AUTH_SECRET` and `CHAT_ORIGINS`.
2. Copy `frontend/.env.example` to `frontend/.env.local`. Set the Google OAuth
   client ID/secret, `AUTH_SECRET`, and the **same** `CHAT_AUTH_SECRET` as backend.
   Generate separate random secrets, for example `openssl rand -hex 32`.
   Never prefix either secret with `NEXT_PUBLIC_`.
3. `BACKEND_URL` is reachable from the Next.js server. `NEXT_PUBLIC_CHAT_API_URL`
   is reachable from the browser. Locally use the example values. On deployment,
   use HTTPS for the public backend and list the frontend origin in `CHAT_ORIGINS`.
4. In the existing Google OAuth client, allow the callback:
   `http://localhost:3000/api/auth/callback/google` and your deployed equivalent.
5. From `backend`, run `uv sync`, then `uv run python migrate_identity.py` once.
   This adds `google_identities`, an `email` column to `students`, and makes
   graduation year nullable. It preserves existing student/vendor records.
6. Run `uv run uvicorn main:app --reload --env-file .env` in backend.
7. Run `npm ci` then `npm run dev` in frontend. Restart both servers after env edits.
8. Sign out of any old sessions, then sign in with Google in two separate browser
   profiles. Open Messages, search for the other user's name, and send a message.
   Keep the recipient on the marketplace to check the red unread badge; opening
   and focusing the conversation clears it. Refresh to verify history persists.

The `students` table now has a nullable, unique `email` column. On a verified
Google sign-in, the backend links to an existing student whose email matches
the verified Google email; otherwise it creates a new student. Seeded synthetic
records have a null email, so they are left untouched. Google's subject remains
the authoritative identity, and an email already linked to a different Google
subject is rejected rather than reassigning an account.

The listing UI still uses its existing local/demo listing storage. This change
links the seller account; it does not replace the listing persistence system.
Use the inbox's real registered-user directory to start conversations; seeded
marketplace sellers do not necessarily have an authenticated account.

## Checks

- `uv run python -m unittest test_identity_chat -v`: isolated auth/ownership/chat tests.
- `npm run lint` and `npm run build`: frontend checks.
- `uv run python -m chat.test_live`: optional real backend/Mongo test. Set two
  fresh `CHAT_TEST_TOKEN_A/B` values from `/api/chat/token` in two signed-in
  browser sessions. It sends two messages and removes their exact IDs afterward.

No attachments, group chats, typing indicators, or delivery receipts are included.

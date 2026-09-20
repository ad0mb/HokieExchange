import os
import asyncio
import time
import socketio
from fastapi import HTTPException
from starlette.concurrency import run_in_threadpool
from sqlalchemy import select
from database import get_session_factory
from identity.models import GoogleIdentity
from identity.router import resolve_student, verify_token
from .schemas import SendMessage

origins = [s.strip() for s in os.getenv("CHAT_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")]
sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins=origins)
repository = None
expiry_tasks = {}


async def expire_connection(sid, expiry):
    await asyncio.sleep(max(0, expiry - time.time()))
    await sio.disconnect(sid)


@sio.event
async def disconnect(sid, reason=None):
    task = expiry_tasks.pop(sid, None)
    if task and task is not asyncio.current_task():
        task.cancel()


def require_repository():
    if repository is None:
        raise HTTPException(503, "Messaging is unavailable. Configure MONGODB_URI and restart the backend.")
    return repository


def room(student_id):
    return f"student:{student_id}"


def authenticated_id(token):
    with get_session_factory()() as db:
        return resolve_student(db, verify_token(token)).student_id


def verify_recipient(student_id):
    with get_session_factory()() as db:
        return db.scalar(select(GoogleIdentity.student_id).where(GoogleIdentity.student_id == student_id)) is not None


@sio.event
async def connect(sid, environ, auth):
    try:
        require_repository()
        if not isinstance(auth, dict):
            return False
        token = (auth or {}).get("token", "")
        user = await run_in_threadpool(authenticated_id, token)
        await sio.save_session(sid, {"token": token, "student_id": user})
        await sio.enter_room(sid, room(user))
        expiry_tasks[sid] = sio.start_background_task(expire_connection, sid, verify_token(token)["exp"])
    except (HTTPException, ValueError, TypeError):
        return False


@sio.event
async def send_message(sid, payload):
    try:
        session = await sio.get_session(sid)
        sender = await run_in_threadpool(authenticated_id, session["token"])
        data = SendMessage.model_validate(payload)
        if data.recipient_id == sender or not await run_in_threadpool(verify_recipient, data.recipient_id):
            return {"ok": False, "error": "Choose another registered user."}
        message = await require_repository().insert(sender, data.recipient_id, data.text)
        for user in (sender, data.recipient_id):
            await sio.emit("message_received", message, room=room(user))
        return {"ok": True, "message": message}
    except HTTPException as exc:
        return {"ok": False, "error": exc.detail}
    except ValueError:
        return {"ok": False, "error": "Enter a message between 1 and 4000 characters."}
    except Exception:
        return {"ok": False, "error": "Message could not be confirmed. Reload history before retrying."}

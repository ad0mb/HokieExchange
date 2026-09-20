import os
import asyncio
import logging
import time
import socketio
from fastapi import HTTPException
from starlette.concurrency import run_in_threadpool
from sqlalchemy import select
from database import get_session_factory
from identity.models import GoogleIdentity
from identity.router import resolve_student, verify_token
from assistant import BOT_STUDENT_ID
from assistant import client as agent_client
from .schemas import SendMessage

logger = logging.getLogger(__name__)

origins = [s.strip() for s in os.getenv("CHAT_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")]
sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins=origins)
repository = None
expiry_tasks = {}
assistant_tasks = {}


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
        if data.recipient_id == sender:
            return {"ok": False, "error": "Choose another user."}
        if data.recipient_id == BOT_STUDENT_ID:
            message = await require_repository().insert(sender, BOT_STUDENT_ID, data.text)
            await sio.emit("message_received", message, room=room(sender))
            previous = assistant_tasks.get(sender)
            task = sio.start_background_task(_answer_assistant, sender, message, previous)
            assistant_tasks[sender] = task
            return {"ok": True, "message": message}
        if not await run_in_threadpool(verify_recipient, data.recipient_id):
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


async def _answer_assistant(student_id: int, request: dict, previous=None) -> None:
    # Serialize requests per student in this worker; never substitute a later message.
    try:
        if previous is not None:
            await asyncio.shield(previous)
        await sio.emit("bot_typing", {"typing": True}, room=room(student_id))
        try:
            host, space, _ = agent_client.settings()
            scope = host + "/" + space
            conversation = await require_repository().get_agent_conversation(student_id, scope)

            async def remember(conversation_id):
                await require_repository().save_agent_conversation(student_id, scope, conversation_id)

            answer = await agent_client.reply(request["text"], conversation, on_conversation=remember)
            text, listings = answer.text, [listing.model_dump() for listing in answer.listings]
        except Exception as exc:
            # Do not log response bodies, credentials, or students' message content.
            logger.warning("Databricks agent invocation failed (%s)", type(exc).__name__)
            text = str(exc) if isinstance(exc, agent_client.GenieError) else "Sorry, the assistant is unavailable right now. Please try again in a moment."
            listings = []
        message = await require_repository().insert(BOT_STUDENT_ID, student_id, text, listings=listings)
        await sio.emit("message_received", message, room=room(student_id))
    except Exception as exc:
        logger.warning("Assistant delivery failed (%s)", type(exc).__name__)
    finally:
        if assistant_tasks.get(student_id) is asyncio.current_task():
            assistant_tasks.pop(student_id, None)
            await sio.emit("bot_typing", {"typing": False}, room=room(student_id))

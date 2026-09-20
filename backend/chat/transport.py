import os
import socketio
from fastapi import HTTPException
from .schemas import ChatIdentity
from .service import ChatService, conversation_key

origins = os.getenv("CHAT_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")
sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins=origins)
repository = None

def require_repository():
    if repository is None:
        raise HTTPException(503, "Chat database is not configured.")
    if os.getenv("CHAT_DEMO_MODE") != "true":
        raise HTTPException(403, "Enable CHAT_DEMO_MODE locally; login integration is not configured.")
    return repository

@sio.event
async def connect(sid, environ, auth):
    try:
        require_repository()
        pair = ChatIdentity.model_validate(auth)
        key = conversation_key(pair)
        await sio.save_session(sid, pair.model_dump())
        await sio.enter_room(sid, key)
    except (ValueError, HTTPException):
        return False

@sio.event
async def send_message(sid, payload):
    try:
        pair = ChatIdentity.model_validate(await sio.get_session(sid))
        message = await ChatService(require_repository()).send(pair, payload)
        await sio.emit("message_received", message, room=conversation_key(pair))
        return {"ok": True, "message": message}
    except ValueError:
        return {"ok": False, "error": "Enter a message between 1 and 4000 characters."}
    except Exception:
        return {"ok": False, "error": "Message could not be confirmed. Reload history before retrying."}

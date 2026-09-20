"""HTTP endpoints for chat."""

from bson import ObjectId
from fastapi import APIRouter, HTTPException

from .schemas import Pair
from .service import conversation_key
from .transport import require_repository

router = APIRouter(prefix="/chat", tags=["chat"])


@router.get("/vendors/{vendor_id}/messages")
async def history(vendor_id: int, student_id: int, before: str | None = None):
    repo = require_repository()
    try:
        pair = Pair(student_id=student_id, vendor_id=vendor_id)
        key = conversation_key(pair)
        if before and not ObjectId.is_valid(before):
            raise ValueError("Invalid history cursor.")
    except ValueError as exc:
        raise HTTPException(422, "Invalid user IDs or history cursor.") from exc
    return await repo.history(key, before)

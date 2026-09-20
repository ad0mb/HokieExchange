from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session
from database import get_db
from identity.models import GoogleIdentity
from identity.router import current_student
from students.models import Student
from vendors.models import Vendor
from .transport import require_repository, room, sio

router = APIRouter(prefix="/chat", tags=["Chat"])


def contact(db, student):
    vendor = db.scalar(select(Vendor.vendor_id).where(Vendor.student_id == student.student_id).order_by(Vendor.vendor_id))
    return {"studentId": student.student_id, "vendorId": vendor,
            "name": f"{student.first_name} {student.last_name}".strip()}


@router.get("/contacts")
def contacts(q: str = Query(default="", max_length=100), user=Depends(current_student), db: Session = Depends(get_db)):
    statement = select(Student).join(GoogleIdentity, GoogleIdentity.student_id == Student.student_id).where(Student.student_id != user.student_id)
    if q.strip():
        statement = statement.where((Student.first_name.contains(q.strip(), autoescape=True)) | (Student.last_name.contains(q.strip(), autoescape=True)))
    return [contact(db, s) for s in db.scalars(statement.order_by(Student.first_name, Student.student_id).limit(50))]


@router.get("/inbox")
async def inbox(user=Depends(current_student), db: Session = Depends(get_db)):
    rows = await require_repository().inbox(user.student_id)
    result = []
    for row in rows:
        doc = row["last"]
        peer_id = doc["recipient_id"] if doc["sender_id"] == user.student_id else doc["sender_id"]
        peer = db.get(Student, peer_id)
        if peer:
            result.append({"contact": contact(db, peer), "lastMessage": require_repository().serialize(doc), "unread": row["unread"]})
    return result


@router.get("/users/{peer_id}/messages")
async def history(peer_id: int, before: str | None = None, user=Depends(current_student)):
    if before and not ObjectId.is_valid(before):
        raise HTTPException(422, "Invalid history cursor.")
    return await require_repository().history(user.student_id, peer_id, before)


class ReadReceipt(BaseModel):
    through: str


@router.post("/users/{peer_id}/read")
async def mark_read(peer_id: int, receipt: ReadReceipt, user=Depends(current_student)):
    if not ObjectId.is_valid(receipt.through):
        raise HTTPException(422, "Invalid message ID.")
    await require_repository().mark_read(user.student_id, peer_id, receipt.through)
    await sio.emit("inbox_changed", {}, room=room(user.student_id))
    return {"ok": True}

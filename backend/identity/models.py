from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class GoogleIdentity(Base):
    __tablename__ = "google_identities"
    google_sub: Mapped[str] = mapped_column(String(255), primary_key=True)
    email: Mapped[str] = mapped_column(String(320), unique=True, nullable=False)
    student_id: Mapped[int] = mapped_column(Integer, ForeignKey("students.student_id", ondelete="CASCADE"), unique=True)

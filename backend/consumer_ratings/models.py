import datetime
import decimal
from typing import Optional

from sqlalchemy import DECIMAL, DateTime, ForeignKeyConstraint, Index, Integer, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class ConsumerRating(Base):
    __tablename__ = "consumer_ratings"
    __table_args__ = (
        ForeignKeyConstraint(["student_id"], ["students.student_id"], ondelete="CASCADE", onupdate="CASCADE", name="consumer_ratings_students_student_id_fk"),
        ForeignKeyConstraint(["vendor_id"], ["vendors.vendor_id"], ondelete="CASCADE", onupdate="CASCADE", name="consumer_ratings_vendors_vendor_id_fk"),
        ForeignKeyConstraint(["appointment_id"], ["appointments.appointment_id"], ondelete="SET NULL", onupdate="CASCADE", name="consumer_ratings_appointments_appointment_id_fk"),
        Index("consumer_ratings_students_student_id_fk", "student_id"),
        Index("consumer_ratings_vendors_vendor_id_fk", "vendor_id"),
        Index("consumer_ratings_appointments_appointment_id_fk", "appointment_id", unique=True),
    )

    rating_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    vendor_id: Mapped[int] = mapped_column(Integer, nullable=False)
    student_id: Mapped[int] = mapped_column(Integer, nullable=False)
    appointment_id: Mapped[Optional[int]] = mapped_column(Integer)
    rating: Mapped[decimal.Decimal] = mapped_column(DECIMAL(5, 1), nullable=False)
    date_created: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, server_default=text("CURRENT_TIMESTAMP"))
    date_updated: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, server_default=text("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"))

    student: Mapped["Student"] = relationship("Student", back_populates="consumer_ratings")
    vendor: Mapped["Vendor"] = relationship("Vendor", back_populates="consumer_ratings")
    appointment: Mapped[Optional["Appointment"]] = relationship("Appointment", back_populates="consumer_ratings")

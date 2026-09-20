import datetime
import decimal
from typing import Optional

from sqlalchemy import DECIMAL, DateTime, ForeignKeyConstraint, Index, Integer, String, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class Appointment(Base):
    __tablename__ = "appointments"
    __table_args__ = (
        ForeignKeyConstraint(
            ["time_block_id"],
            ["time-blocks.time-block-id"],
            ondelete="CASCADE",
            onupdate="CASCADE",
            name="fk_appointments_time_block",
        ),
        ForeignKeyConstraint(
            ["student_id"],
            ["students.student_id"],
            ondelete="CASCADE",
            onupdate="CASCADE",
            name="fk_appointments_student",
        ),
        Index("uq_appointments_time_block_booked_at", "time_block_id", "booked_at", unique=True),
        Index("fk_appointments_student", "student_id"),
    )

    appointment_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    time_block_id: Mapped[int] = mapped_column(Integer, nullable=False)
    booked_at: Mapped[datetime.datetime] = mapped_column(DateTime, nullable=False)
    student_id: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(
        String(16),
        nullable=False,
        server_default=text("'active'"),
        comment="'seller-cancelled', 'buyer-cancelled', 'active', 'complete', or 'no-show'",
    )
    price_at_booking: Mapped[decimal.Decimal] = mapped_column(DECIMAL(10, 2), nullable=False)
    cancel_reason: Mapped[Optional[str]] = mapped_column(String(255))
    cancelled_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime)
    completed_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime)
    date_created: Mapped[Optional[datetime.datetime]] = mapped_column(
        DateTime, server_default=text("CURRENT_TIMESTAMP")
    )
    date_updated: Mapped[Optional[datetime.datetime]] = mapped_column(
        DateTime, server_default=text("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
    )

    time_block: Mapped["TimeBlock"] = relationship("TimeBlock", back_populates="appointments")
    student: Mapped["Student"] = relationship("Student", back_populates="appointments")
    vendor_ratings: Mapped[list["VendorRating"]] = relationship(
        "VendorRating", back_populates="appointment", passive_deletes=True
    )
    consumer_ratings: Mapped[list["ConsumerRating"]] = relationship(
        "ConsumerRating", back_populates="appointment", passive_deletes=True
    )

    @property
    def service_name(self) -> str:
        return self.time_block.service.service_name

    @property
    def vendor_id(self) -> int:
        return self.time_block.service.vendor_id

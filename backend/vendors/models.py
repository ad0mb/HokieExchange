import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKeyConstraint, Index, Integer, String, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class Vendor(Base):
    __tablename__ = "vendors"
    __table_args__ = (
        ForeignKeyConstraint(
            ["student_id"],
            ["students.student_id"],
            ondelete="CASCADE",
            onupdate="CASCADE",
            name="vendors_students_student_id_fk",
        ),
        Index("vendors_students_student_id_fk", "student_id"),
    )

    vendor_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    student_id: Mapped[int] = mapped_column(Integer, nullable=False)
    description: Mapped[str] = mapped_column(String(1000), nullable=False)
    date_created: Mapped[Optional[datetime.datetime]] = mapped_column(
        DateTime, server_default=text("CURRENT_TIMESTAMP")
    )
    date_updated: Mapped[Optional[datetime.datetime]] = mapped_column(
        DateTime, server_default=text("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
    )

    student: Mapped["Student"] = relationship("Student", back_populates="vendors")
    services: Mapped[list["Service"]] = relationship(
        "Service", back_populates="vendor", passive_deletes=True
    )
    items: Mapped[list["Item"]] = relationship(
        "Item", back_populates="vendor", passive_deletes=True
    )
    consumer_ratings: Mapped[list["ConsumerRating"]] = relationship(
        "ConsumerRating", back_populates="vendor", passive_deletes=True
    )
    vendor_ratings: Mapped[list["VendorRating"]] = relationship(
        "VendorRating", back_populates="vendor", passive_deletes=True
    )

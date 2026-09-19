import datetime
import decimal
from typing import Optional

from sqlalchemy import DECIMAL, DateTime, ForeignKeyConstraint, Index, Integer, String, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class VendorRating(Base):
    __tablename__ = "vendor_ratings"
    __table_args__ = (
        ForeignKeyConstraint(["student_id"], ["students.student_id"], ondelete="CASCADE", onupdate="CASCADE", name="vendor_ratings_students_student_id_fk"),
        ForeignKeyConstraint(["vendor_id"], ["vendors.vendor_id"], ondelete="CASCADE", onupdate="CASCADE", name="vendor_ratings_vendors_vendor_id_fk"),
        Index("vendor_ratings_students_student_id_fk", "student_id"),
        Index("vendor_ratings_vendors_vendor_id_fk", "vendor_id"),
    )

    rating_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    student_id: Mapped[int] = mapped_column(Integer, nullable=False)
    vendor_id: Mapped[int] = mapped_column(Integer, nullable=False)
    rating: Mapped[decimal.Decimal] = mapped_column(DECIMAL(10, 0), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(1000))
    date_created: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, server_default=text("CURRENT_TIMESTAMP"))
    date_updated: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, server_default=text("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"))

    student: Mapped["Student"] = relationship("Student", back_populates="vendor_ratings")
    vendor: Mapped["Vendor"] = relationship("Vendor", back_populates="vendor_ratings")

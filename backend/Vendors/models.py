from sqlalchemy import ForeignKeyConstraint, Index, Integer, String
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

    student: Mapped["Student"] = relationship("Student", back_populates="vendors")
    services: Mapped[list["Service"]] = relationship(
        "Service", back_populates="vendor", passive_deletes=True
    )

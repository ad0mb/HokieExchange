import datetime
from typing import Optional

from sqlalchemy import Index, Integer, TIMESTAMP, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class Student(Base):
    __tablename__ = "students"
    __table_args__ = (Index("students_pk_2", "sso_id", unique=True),)

    student_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    first_name: Mapped[int] = mapped_column(Integer, nullable=False)
    last_name: Mapped[int] = mapped_column(Integer, nullable=False)
    graduation_year: Mapped[int] = mapped_column(Integer, nullable=False)
    sso_id: Mapped[Optional[int]] = mapped_column(Integer)
    date_created: Mapped[Optional[datetime.datetime]] = mapped_column(
        TIMESTAMP, server_default=text("CURRENT_TIMESTAMP")
    )
    date_updated: Mapped[Optional[datetime.datetime]] = mapped_column(
        TIMESTAMP, server_default=text("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
    )

    vendors: Mapped[list["Vendor"]] = relationship(
        "Vendor", back_populates="student", passive_deletes=True
    )

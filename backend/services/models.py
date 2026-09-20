import datetime
import decimal
from typing import Optional

from sqlalchemy import DECIMAL, DateTime, ForeignKeyConstraint, Index, Integer, String, TIMESTAMP, Time, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import TypeDecorator

from database import Base


class TimeValue(TypeDecorator):
    """TIME column whose driver (MySQL/DataBricks) may return a string."""

    impl = Time
    cache_ok = True

    def result_processor(self, dialect, coltype):
        def process(value):
            if value is None or isinstance(value, datetime.time):
                return value
            if isinstance(value, str):
                return datetime.time.fromisoformat(value)
            if isinstance(value, datetime.timedelta):
                seconds = value.seconds
                return datetime.time(
                    seconds // 3600,
                    (seconds % 3600) // 60,
                    seconds % 60,
                    microsecond=value.microseconds,
                )
            return value

        return process


class Service(Base):
    __tablename__ = "services"
    __table_args__ = (
        ForeignKeyConstraint(
            ["vendor_id"],
            ["vendors.vendor_id"],
            ondelete="CASCADE",
            onupdate="CASCADE",
            name="services_vendors_vendor_id_fk",
        ),
        Index("services_vendors_vendor_id_fk", "vendor_id"),
    )

    service_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    vendor_id: Mapped[int] = mapped_column(Integer, nullable=False)
    service_name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(String(1000), nullable=False)
    location: Mapped[Optional[str]] = mapped_column(String(255))
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    price: Mapped[decimal.Decimal] = mapped_column(DECIMAL(10, 2), nullable=False)
    duration: Mapped[datetime.time] = mapped_column(TimeValue, nullable=False)
    date_created: Mapped[Optional[datetime.datetime]] = mapped_column(
        TIMESTAMP, server_default=text("CURRENT_TIMESTAMP")
    )
    date_updated: Mapped[Optional[datetime.datetime]] = mapped_column(
        TIMESTAMP, server_default=text("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
    )

    vendor: Mapped["Vendor"] = relationship("Vendor", back_populates="services")
    time_blocks: Mapped[list["TimeBlock"]] = relationship(
        "TimeBlock", back_populates="service", passive_deletes=True
    )

    @property
    def seller_name(self) -> str:
        return f"{self.vendor.student.first_name} {self.vendor.student.last_name}".strip()


class TimeBlock(Base):
    __tablename__ = "time-blocks"
    __table_args__ = (
        ForeignKeyConstraint(
            ["service_id"],
            ["services.service_id"],
            ondelete="CASCADE",
            onupdate="CASCADE",
            name="time-blocks_services_service_id_fk",
        ),
        Index("time-blocks_services_service_id_fk", "service_id"),
    )

    time_block_id: Mapped[int] = mapped_column(
        "time-block-id", Integer, primary_key=True, autoincrement=True
    )
    service_id: Mapped[int] = mapped_column(Integer, nullable=False)
    day_of_week: Mapped[int] = mapped_column(Integer, nullable=False, comment="0=Monday ... 6=Sunday")
    start_time: Mapped[datetime.time] = mapped_column(TimeValue, nullable=False)
    status: Mapped[str] = mapped_column(
        String(11),
        nullable=False,
        server_default=text("'available'"),
        comment="'available' or 'unavailable'",
    )
    date_created: Mapped[Optional[datetime.datetime]] = mapped_column(
        DateTime, server_default=text("CURRENT_TIMESTAMP")
    )
    date_updated: Mapped[Optional[datetime.datetime]] = mapped_column(
        DateTime, server_default=text("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
    )

    service: Mapped["Service"] = relationship("Service", back_populates="time_blocks")
    appointments: Mapped[list["Appointment"]] = relationship(
        "Appointment", back_populates="time_block", passive_deletes=True
    )

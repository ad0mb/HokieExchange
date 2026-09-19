import datetime
import decimal
from typing import Optional

from sqlalchemy import DECIMAL, ForeignKeyConstraint, Index, Integer, String, TIMESTAMP, Time, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


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
    schedule_type: Mapped[Optional[str]] = mapped_column(String(10), comment='"on-demand" or "per-block"')
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


class TimeBlock(Base):
    __tablename__ = "time-blocks-config"
    __table_args__ = (
        ForeignKeyConstraint(
            ["service_id"],
            ["services.service_id"],
            ondelete="CASCADE",
            onupdate="CASCADE",
            name="time-blocks-config_services_service_id_fk",
        ),
        Index("time-blocks-config_services_service_id_fk", "service_id"),
    )

    config_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    service_id: Mapped[int] = mapped_column(Integer, nullable=False)
    duration: Mapped[datetime.time] = mapped_column(Time, nullable=False)
    price: Mapped[decimal.Decimal] = mapped_column(DECIMAL(10, 0), nullable=False)
    date_created: Mapped[Optional[datetime.datetime]] = mapped_column(
        TIMESTAMP, server_default=text("CURRENT_TIMESTAMP")
    )
    date_updated: Mapped[Optional[datetime.datetime]] = mapped_column(
        TIMESTAMP, server_default=text("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
    )

    service: Mapped["Service"] = relationship("Service", back_populates="time_blocks")

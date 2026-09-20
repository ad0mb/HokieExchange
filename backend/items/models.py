import datetime
import decimal
from typing import Optional

from sqlalchemy import DECIMAL, DateTime, ForeignKeyConstraint, Index, Integer, String, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class Item(Base):
    __tablename__ = "items"
    __table_args__ = (
        ForeignKeyConstraint(
            ["vendor_id"],
            ["vendors.vendor_id"],
            ondelete="CASCADE",
            onupdate="CASCADE",
            name="items_vendors_vendor_id_fk",
        ),
        Index("items_vendors_vendor_id_fk", "vendor_id"),
    )

    item_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    vendor_id: Mapped[int] = mapped_column(Integer, nullable=False)
    item_name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(1000))
    price: Mapped[decimal.Decimal] = mapped_column(DECIMAL(10, 0), nullable=False)
    stock: Mapped[int] = mapped_column(Integer, nullable=False)
    date_created: Mapped[Optional[datetime.datetime]] = mapped_column(
        DateTime, server_default=text("CURRENT_TIMESTAMP")
    )
    date_updated: Mapped[Optional[datetime.datetime]] = mapped_column(
        DateTime, server_default=text("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
    )

    vendor: Mapped["Vendor"] = relationship("Vendor", back_populates="items")

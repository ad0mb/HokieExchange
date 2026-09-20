import datetime
import decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ItemCreate(BaseModel):
    vendor_id: int
    item_name: str
    description: Optional[str] = None
    price: decimal.Decimal
    stock: int


class ItemUpdate(BaseModel):
    item_name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[decimal.Decimal] = None
    stock: Optional[int] = None


class ItemRead(BaseModel):
    item_id: int
    vendor_id: int
    item_name: str
    description: Optional[str]
    price: decimal.Decimal
    stock: int
    date_created: Optional[datetime.datetime]
    date_updated: Optional[datetime.datetime]

    model_config = ConfigDict(from_attributes=True)

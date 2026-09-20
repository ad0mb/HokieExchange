import datetime
import decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict


class VendorRatingCreate(BaseModel):
    student_id: int
    vendor_id: int
    rating: decimal.Decimal
    description: Optional[str] = None
    appointment_id: Optional[int] = None


class VendorRatingUpdate(BaseModel):
    rating: Optional[decimal.Decimal] = None
    description: Optional[str] = None


class VendorRatingRead(BaseModel):
    rating_id: int
    student_id: int
    vendor_id: int
    appointment_id: Optional[int]
    rating: decimal.Decimal
    description: Optional[str]
    date_created: Optional[datetime.datetime]
    date_updated: Optional[datetime.datetime]

    model_config = ConfigDict(from_attributes=True)


class VendorRatingAverage(BaseModel):
    vendor_id: int
    average: Optional[decimal.Decimal]
    count: int

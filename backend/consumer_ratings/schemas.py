import datetime
import decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ConsumerRatingCreate(BaseModel):
    vendor_id: int
    student_id: int
    rating: decimal.Decimal


class ConsumerRatingUpdate(BaseModel):
    rating: Optional[decimal.Decimal] = None


class ConsumerRatingRead(BaseModel):
    rating_id: int
    vendor_id: int
    student_id: int
    rating: decimal.Decimal
    date_created: Optional[datetime.datetime]
    date_updated: Optional[datetime.datetime]

    model_config = ConfigDict(from_attributes=True)

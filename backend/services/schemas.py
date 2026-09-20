import datetime
import decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ServiceCreate(BaseModel):
    vendor_id: int
    service_name: str
    description: str
    location: Optional[str] = None
    category: str
    price: decimal.Decimal
    duration: datetime.time


class ServiceUpdate(BaseModel):
    service_name: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    category: Optional[str] = None
    price: Optional[decimal.Decimal] = None
    duration: Optional[datetime.time] = None


class ServiceRead(BaseModel):
    service_id: int
    vendor_id: int
    service_name: str
    description: str
    location: Optional[str]
    category: str
    price: decimal.Decimal
    duration: datetime.time
    date_created: Optional[datetime.datetime]
    date_updated: Optional[datetime.datetime]

    model_config = ConfigDict(from_attributes=True)


class ServiceWithRating(BaseModel):
    service_id: int
    vendor_id: int
    service_name: str
    description: str
    location: Optional[str]
    category: str
    price: decimal.Decimal
    duration: datetime.time
    rating: Optional[decimal.Decimal]
    rating_count: int
    date_created: Optional[datetime.datetime]
    date_updated: Optional[datetime.datetime]


class TimeBlockCreate(BaseModel):
    service_id: int
    day_of_week: int
    start_time: datetime.time
    status: str = "available"


class TimeBlockUpdate(BaseModel):
    day_of_week: Optional[int] = None
    start_time: Optional[datetime.time] = None
    status: Optional[str] = None


class TimeBlockRead(BaseModel):
    time_block_id: int
    service_id: int
    day_of_week: int
    start_time: datetime.time
    status: str
    date_created: Optional[datetime.datetime]
    date_updated: Optional[datetime.datetime]

    model_config = ConfigDict(from_attributes=True)


class AvailabilitySlot(BaseModel):
    time_block_id: int
    day_of_week: int
    start_time: datetime.time
    datetime: datetime.datetime
    available: bool

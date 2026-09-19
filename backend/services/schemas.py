import datetime
import decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ServiceCreate(BaseModel):
    vendor_id: int
    service_name: str
    description: str
    location: Optional[str] = None
    schedule_type: Optional[str] = None


class ServiceUpdate(BaseModel):
    service_name: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    schedule_type: Optional[str] = None


class ServiceRead(BaseModel):
    service_id: int
    vendor_id: int
    service_name: str
    description: str
    location: Optional[str]
    schedule_type: Optional[str]
    date_created: Optional[datetime.datetime]
    date_updated: Optional[datetime.datetime]

    model_config = ConfigDict(from_attributes=True)


class TimeBlockConfigCreate(BaseModel):
    service_id: int
    duration: datetime.time
    price: decimal.Decimal


class TimeBlockConfigUpdate(BaseModel):
    duration: Optional[datetime.time] = None
    price: Optional[decimal.Decimal] = None


class TimeBlockConfigRead(BaseModel):
    config_id: int
    service_id: int
    duration: datetime.time
    price: decimal.Decimal
    date_created: Optional[datetime.datetime]
    date_updated: Optional[datetime.datetime]

    model_config = ConfigDict(from_attributes=True)


class TimeBlockCreate(BaseModel):
    config_id: int
    start_time: datetime.datetime


class TimeBlockUpdate(BaseModel):
    start_time: Optional[datetime.datetime] = None


class TimeBlockRead(BaseModel):
    time_block_id: int
    config_id: int
    start_time: datetime.datetime
    date_created: Optional[datetime.datetime]
    date_updated: Optional[datetime.datetime]

    model_config = ConfigDict(from_attributes=True)

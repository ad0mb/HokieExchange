import datetime
import decimal

from enum import StrEnum
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class TimeBlockUpdate(BaseModel):
    time_block_id: Optional[int] = None
    config_id: Optional[int] = None
    start_time: Optional[datetime.datetime] = None


class TimeBlockRead(BaseModel):
    time_block_id: int
    config_id: int
    start_time: datetime.datetime
    date_created: Optional[datetime.datetime]
    date_updated: Optional[datetime.datetime]

    model_config = ConfigDict(from_attributes=True)


class TimeBlockCreate(BaseModel):
    config_id: int
    start_time: datetime.datetime


class TimeBlockConfigUpdate(BaseModel):
    config_id: Optional[int] = None
    duration: Optional[datetime.time] = None
    price: Optional[decimal.Decimal] = None
    time_blocks: Optional[list[TimeBlockUpdate]] = None


class TimeBlockConfigRead(BaseModel):
    config_id: int
    service_id: int
    duration: datetime.time
    price: decimal.Decimal
    date_created: Optional[datetime.datetime]
    date_updated: Optional[datetime.datetime]
    time_blocks: list[TimeBlockRead] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class TimeBlockConfigCreate(BaseModel):
    service_id: int
    duration: datetime.time
    price: decimal.Decimal
    time_blocks: Optional[list[TimeBlockCreate]] = None


class ServiceCreate(BaseModel):
    vendor_id: int
    service_name: str
    description: str
    location: Optional[str] = None
    schedule_type: Optional[str] = None
    time_block_configs: Optional[list[TimeBlockConfigCreate]] = None


class ServiceUpdate(BaseModel):
    service_name: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    schedule_type: Optional[str] = None
    time_block_configs: Optional[list[TimeBlockConfigUpdate]] = None
    time_blocks: Optional[list[TimeBlockUpdate]] = None


class ServiceRead(BaseModel):
    service_id: int
    vendor_id: int
    service_name: str
    description: str
    location: Optional[str]
    schedule_type: Optional[str]
    date_created: Optional[datetime.datetime]
    date_updated: Optional[datetime.datetime]
    time_block_configs: list[TimeBlockConfigRead] = Field(default_factory=list)
    time_blocks: list[TimeBlockRead] = Field(default_factory=list)
    time_block_config: Optional[TimeBlockConfigRead] = None

    model_config = ConfigDict(from_attributes=True)


class ServiceCategory(StrEnum):
    MISC = "Miscellaneous"
import datetime
import decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict


class AppointmentCreate(BaseModel):
    time_block_id: int
    booked_at: datetime.datetime
    student_id: int
    status: str = "active"
    cancel_reason: Optional[str] = None
    cancelled_at: Optional[datetime.datetime] = None
    completed_at: Optional[datetime.datetime] = None


class AppointmentUpdate(BaseModel):
    status: Optional[str] = None
    cancel_reason: Optional[str] = None
    cancelled_at: Optional[datetime.datetime] = None
    completed_at: Optional[datetime.datetime] = None


class AppointmentRead(BaseModel):
    appointment_id: int
    time_block_id: int
    booked_at: datetime.datetime
    student_id: int
    status: str
    service_name: str
    vendor_id: int
    price_at_booking: decimal.Decimal
    cancel_reason: Optional[str]
    cancelled_at: Optional[datetime.datetime]
    completed_at: Optional[datetime.datetime]
    date_created: Optional[datetime.datetime]
    date_updated: Optional[datetime.datetime]

    model_config = ConfigDict(from_attributes=True)

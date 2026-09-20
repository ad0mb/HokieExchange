import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class VendorCreate(BaseModel):
    student_id: int
    description: str


class VendorUpdate(BaseModel):
    description: Optional[str] = None


class VendorRead(BaseModel):
    vendor_id: int
    student_id: int
    description: str
    date_created: Optional[datetime.datetime]
    date_updated: Optional[datetime.datetime]

    model_config = ConfigDict(from_attributes=True)

import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class StudentCreate(BaseModel):
    first_name: str
    last_name: str
    graduation_year: int
    sso_id: Optional[int] = None


class StudentUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    graduation_year: Optional[int] = None
    sso_id: Optional[int] = None


class StudentRead(BaseModel):
    student_id: int
    first_name: str
    last_name: str
    graduation_year: int
    sso_id: Optional[int]
    date_created: Optional[datetime.datetime]
    date_updated: Optional[datetime.datetime]

    model_config = ConfigDict(from_attributes=True)

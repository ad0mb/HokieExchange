from typing import Literal
from pydantic import BaseModel, Field, ConfigDict

class Pair(BaseModel):
    student_id: int = Field(gt=0)
    vendor_id: int = Field(gt=0)

class ChatIdentity(Pair):
    role: Literal["student", "vendor"]

class SendMessage(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    text: str = Field(min_length=1, max_length=4000)

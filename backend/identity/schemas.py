from pydantic import BaseModel


class Account(BaseModel):
    studentId: int
    vendorId: int | None
    name: str

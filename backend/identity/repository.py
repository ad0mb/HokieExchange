from sqlalchemy import select
from sqlalchemy.orm import Session

from identity.models import GoogleIdentity
from students.models import Student
from vendors.models import Vendor


class IdentityRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_identity(self, google_sub: str) -> GoogleIdentity | None:
        return self.db.get(GoogleIdentity, google_sub)

    def get_identity_by_email(self, email: str) -> GoogleIdentity | None:
        return self.db.scalar(select(GoogleIdentity).where(GoogleIdentity.email == email))

    def get_student(self, student_id: int) -> Student | None:
        return self.db.get(Student, student_id)

    def get_student_by_email(self, email: str) -> Student | None:
        return self.db.scalar(select(Student).where(Student.email == email).order_by(Student.student_id).limit(1))

    def create_student(self, first_name: str, last_name: str, email: str) -> Student:
        student = Student(first_name=first_name, last_name=last_name, graduation_year=None, email=email)
        self.db.add(student)
        self.db.flush()
        return student

    def link(self, google_sub: str, email: str, student_id: int) -> None:
        self.db.add(GoogleIdentity(google_sub=google_sub, email=email, student_id=student_id))
        self.db.commit()

    def get_vendor(self, student_id: int) -> Vendor | None:
        return self.db.scalar(select(Vendor).where(Vendor.student_id == student_id).order_by(Vendor.vendor_id).limit(1))

    def create_vendor(self, student_id: int) -> Vendor:
        vendor = Vendor(student_id=student_id, description="")
        self.db.add(vendor)
        self.db.commit()
        return vendor

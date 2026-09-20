from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from database import get_db
from students.models import Student
from students.schemas import StudentCreate, StudentUpdate


class StudentRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, student_id: int) -> Student | None:
        return self.db.get(Student, student_id)

    def get_all(self) -> list[Student]:
        return list(self.db.scalars(select(Student)).all())

    def get_by_sso_id(self, sso_id: int) -> Student | None:
        return self.db.scalar(select(Student).where(Student.sso_id == sso_id))

    def create(self, data: StudentCreate) -> Student:
        student = Student(**data.model_dump())
        self.db.add(student)
        self.db.commit()
        self.db.refresh(student)
        return student

    def update(self, student: Student, data: StudentUpdate) -> Student:
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(student, field, value)

        self.db.commit()
        self.db.refresh(student)
        return student

    def delete(self, student: Student) -> None:
        self.db.delete(student)
        self.db.commit()


async def get_student_repo(db: Session = Depends(get_db)) -> StudentRepository:
    return StudentRepository(db)

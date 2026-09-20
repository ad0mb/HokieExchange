from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from students.repository import StudentRepository
from students.schemas import StudentCreate, StudentRead, StudentUpdate

router = APIRouter(prefix="/students", tags=["Students"])


def get_student_repository(db: Session = Depends(get_db)) -> StudentRepository:
    return StudentRepository(db)


Repo = Annotated[StudentRepository, Depends(get_student_repository)]


@router.get("", response_model=list[StudentRead])
def list_students(repo: Repo) -> list[StudentRead]:
    return [StudentRead.model_validate(student) for student in repo.get_all()]


@router.get("/{student_id}", response_model=StudentRead)
def get_student(student_id: int, repo: Repo) -> StudentRead:
    student = repo.get_by_id(student_id)
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    return StudentRead.model_validate(student)


@router.post("", response_model=StudentRead, status_code=201)
def create_student(data: StudentCreate, repo: Repo) -> StudentRead:
    return StudentRead.model_validate(repo.create(data))


@router.patch("/{student_id}", response_model=StudentRead)
def update_student(student_id: int, data: StudentUpdate, repo: Repo) -> StudentRead:
    student = repo.get_by_id(student_id)
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    return StudentRead.model_validate(repo.update(student, data))


@router.delete("/{student_id}", status_code=204)
def delete_student(student_id: int, repo: Repo) -> None:
    student = repo.get_by_id(student_id)
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    repo.delete(student)

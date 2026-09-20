from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from students.repository import StudentRepository
from students.schemas import StudentCreate, StudentRead, StudentUpdate
from identity.router import current_student

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
def create_student(data: StudentCreate, repo: Repo, user=Depends(current_student)) -> StudentRead:
    raise HTTPException(409, "Your student account is created automatically during Google sign-in.")


@router.patch("/{student_id}", response_model=StudentRead)
def update_student(student_id: int, data: StudentUpdate, repo: Repo, user=Depends(current_student)) -> StudentRead:
    if student_id != user.student_id:
        raise HTTPException(403, "You can only edit your own account.")
    student = repo.get_by_id(student_id)
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    return StudentRead.model_validate(repo.update(student, data))


@router.delete("/{student_id}", status_code=204)
def delete_student(student_id: int, repo: Repo, user=Depends(current_student)) -> None:
    if student_id != user.student_id:
        raise HTTPException(403, "You can only delete your own account.")
    student = repo.get_by_id(student_id)
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    repo.delete(student)

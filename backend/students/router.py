from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from students.repository import StudentRepository, get_student_repo
from students.schemas import StudentCreate, StudentRead, StudentUpdate
from vendors.repository import VendorRepository, get_vendor_repo
from vendors.schemas import VendorCreate, VendorRead

router = APIRouter(prefix="/students", tags=["Students"])

StudentRepo = Annotated[StudentRepository, Depends(get_student_repo)]
VendorRepo = Annotated[VendorRepository, Depends(get_vendor_repo)]


@router.get("/", response_model=list[StudentRead])
async def get_students(repo: StudentRepo):
    return repo.get_all()


@router.get("/{student_id}", response_model=StudentRead)
async def get_student(repo: StudentRepo, student_id: int):
    student = repo.get_by_id(student_id)
    if student is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found.")
    return student


@router.post("/", response_model=StudentRead, status_code=status.HTTP_201_CREATED)
async def create_student(repo: StudentRepo, student_data: StudentCreate):
    if student_data.sso_id is not None and repo.get_by_sso_id(student_data.sso_id) is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A student with this SSO ID already exists.")
    return repo.create(student_data)


@router.patch("/{student_id}", response_model=StudentRead)
async def update_student(repo: StudentRepo, student_id: int, student_data: StudentUpdate):
    student = repo.get_by_id(student_id)
    if student is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found.")
    return repo.update(student, student_data)


@router.delete("/{student_id}")
async def delete_student(repo: StudentRepo, student_id: int):
    student = repo.get_by_id(student_id)
    if student is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found.")

    repo.delete(student)
    return {"message": "Student account deleted successfully."}


@router.post("/{student_id}/vendor-profile", response_model=VendorRead, status_code=status.HTTP_201_CREATED)
async def create_student_vendor_profile(repo: StudentRepo, vendor_repo: VendorRepo, student_id: int, vendor_data: VendorCreate):
    student = repo.get_by_id(student_id)
    if student is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found.")

    if vendor_data.student_id != student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Request student_id must match the route student_id.",
        )

    if vendor_repo.get_by_student_id(student_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This student already has a vendor profile.",
        )

    return vendor_repo.create(vendor_data)

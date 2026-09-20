from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from vendors.repository import VendorRepository
from vendors.schemas import VendorCreate, VendorRead, VendorUpdate
from identity.router import current_student

router = APIRouter(prefix="/vendors", tags=["Vendors"])


def get_vendor_repository(db: Session = Depends(get_db)) -> VendorRepository:
    return VendorRepository(db)


Repo = Annotated[VendorRepository, Depends(get_vendor_repository)]


@router.get("", response_model=list[VendorRead])
def list_vendors(repo: Repo) -> list[VendorRead]:
    return [VendorRead.model_validate(vendor) for vendor in repo.get_all()]


@router.get("/{vendor_id}", response_model=VendorRead)
def get_vendor(vendor_id: int, repo: Repo) -> VendorRead:
    vendor = repo.get_by_id(vendor_id)
    if vendor is None:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return VendorRead.model_validate(vendor)


@router.post("", response_model=VendorRead, status_code=201)
def create_vendor(data: VendorCreate, repo: Repo, user=Depends(current_student)) -> VendorRead:
    raise HTTPException(409, "Use /auth/vendor to activate your linked seller account.")


@router.patch("/{vendor_id}", response_model=VendorRead)
def update_vendor(vendor_id: int, data: VendorUpdate, repo: Repo, user=Depends(current_student)) -> VendorRead:
    vendor = repo.get_by_id(vendor_id)
    if vendor is None:
        raise HTTPException(status_code=404, detail="Vendor not found")
    if vendor.student_id != user.student_id:
        raise HTTPException(403, "You can only edit your own seller account.")
    return VendorRead.model_validate(repo.update(vendor, data))


@router.delete("/{vendor_id}", status_code=204)
def delete_vendor(vendor_id: int, repo: Repo, user=Depends(current_student)) -> None:
    vendor = repo.get_by_id(vendor_id)
    if vendor is None:
        raise HTTPException(status_code=404, detail="Vendor not found")
    if vendor.student_id != user.student_id:
        raise HTTPException(403, "You can only delete your own seller account.")
    repo.delete(vendor)

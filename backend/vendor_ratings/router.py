from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from vendor_ratings.repository import VendorRatingRepository, get_vendor_rating_repo
from vendor_ratings.schemas import VendorRatingCreate, VendorRatingRead, VendorRatingUpdate

router = APIRouter(prefix="/vendors", tags=["Vendor Ratings"])

VendorRatingRepo = Annotated[VendorRatingRepository, Depends(get_vendor_rating_repo)]


@router.get("/ratings", response_model=list[VendorRatingRead])
async def get_vendor_ratings(repo: VendorRatingRepo):
    return repo.get_all()


@router.get("/{vendor_id}/ratings", response_model=list[VendorRatingRead])
async def get_vendor_ratings_for_vendor(repo: VendorRatingRepo, vendor_id: int):
    return repo.get_for_vendor(vendor_id)


@router.get("/{vendor_id}/ratings/{rating_id}", response_model=VendorRatingRead)
async def get_vendor_rating(repo: VendorRatingRepo, vendor_id: int, rating_id: int):
    vendor_rating = repo.get_by_id(rating_id)
    if vendor_rating is None or vendor_rating.vendor_id != vendor_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor rating not found.")
    return vendor_rating


@router.get("/student/{student_id}/ratings", response_model=list[VendorRatingRead])
async def get_vendor_ratings_for_student(repo: VendorRatingRepo, student_id: int):
    return repo.get_for_student(student_id)


@router.post("/{vendor_id}/ratings", response_model=VendorRatingRead, status_code=status.HTTP_201_CREATED)
async def create_vendor_rating(repo: VendorRatingRepo, vendor_id: int, rating_data: VendorRatingCreate):
    if rating_data.vendor_id != vendor_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Request vendor_id must match the route vendor_id.",
        )
    return repo.create(rating_data)


@router.patch("/{vendor_id}/ratings/{rating_id}", response_model=VendorRatingRead)
async def update_vendor_rating(repo: VendorRatingRepo, vendor_id: int, rating_id: int, rating_data: VendorRatingUpdate):
    vendor_rating = repo.get_by_id(rating_id)
    if vendor_rating is None or vendor_rating.vendor_id != vendor_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor rating not found.")
    return repo.update(vendor_rating, rating_data)


@router.delete("/{vendor_id}/ratings/{rating_id}")
async def delete_vendor_rating(repo: VendorRatingRepo, vendor_id: int, rating_id: int):
    vendor_rating = repo.get_by_id(rating_id)
    if vendor_rating is None or vendor_rating.vendor_id != vendor_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor rating not found.")

    repo.delete(vendor_rating)
    return {"message": "Vendor rating deleted successfully."}

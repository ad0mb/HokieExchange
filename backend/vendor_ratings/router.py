from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from vendor_ratings.repository import VendorRatingRepository
from vendor_ratings.schemas import (
    VendorRatingAverage,
    VendorRatingCreate,
    VendorRatingRead,
    VendorRatingUpdate,
)

router = APIRouter(prefix="/vendor-ratings", tags=["Vendor Ratings"])


def get_vendor_rating_repository(db: Session = Depends(get_db)) -> VendorRatingRepository:
    return VendorRatingRepository(db)


Repo = Annotated[VendorRatingRepository, Depends(get_vendor_rating_repository)]


@router.get("", response_model=list[VendorRatingRead])
def list_vendor_ratings(
    repo: Repo,
    vendor_id: int | None = None,
    student_id: int | None = None,
    search: str | None = None,
    sort: str | None = None,
) -> list[VendorRatingRead]:
    ratings = repo.list_reviews(
        vendor_id=vendor_id,
        student_id=student_id,
        search=search,
        sort=sort,
    )
    return [VendorRatingRead.model_validate(rating) for rating in ratings]


@router.get("/average", response_model=VendorRatingAverage)
def get_vendor_rating_average(vendor_id: int, repo: Repo) -> VendorRatingAverage:
    average, count = repo.average_for_vendor(vendor_id)
    return VendorRatingAverage(vendor_id=vendor_id, average=average, count=count)


@router.get("/{rating_id}", response_model=VendorRatingRead)
def get_vendor_rating(rating_id: int, repo: Repo) -> VendorRatingRead:
    rating = repo.get_by_id(rating_id)
    if rating is None:
        raise HTTPException(status_code=404, detail="Vendor rating not found")
    return VendorRatingRead.model_validate(rating)


@router.post("", response_model=VendorRatingRead, status_code=201)
def create_vendor_rating(data: VendorRatingCreate, repo: Repo) -> VendorRatingRead:
    return VendorRatingRead.model_validate(repo.create(data))


@router.patch("/{rating_id}", response_model=VendorRatingRead)
def update_vendor_rating(
    rating_id: int, data: VendorRatingUpdate, repo: Repo
) -> VendorRatingRead:
    rating = repo.get_by_id(rating_id)
    if rating is None:
        raise HTTPException(status_code=404, detail="Vendor rating not found")
    return VendorRatingRead.model_validate(repo.update(rating, data))


@router.delete("/{rating_id}", status_code=204)
def delete_vendor_rating(rating_id: int, repo: Repo) -> None:
    rating = repo.get_by_id(rating_id)
    if rating is None:
        raise HTTPException(status_code=404, detail="Vendor rating not found")
    repo.delete(rating)

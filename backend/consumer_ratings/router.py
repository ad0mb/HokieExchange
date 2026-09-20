from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from consumer_ratings.repository import ConsumerRatingRepository, get_consumer_rating_repo
from consumer_ratings.schemas import ConsumerRatingCreate, ConsumerRatingRead, ConsumerRatingUpdate

router = APIRouter(prefix="/students", tags=["Consumer Ratings"])

ConsumerRatingRepo = Annotated[ConsumerRatingRepository, Depends(get_consumer_rating_repo)]


@router.get("/ratings", response_model=list[ConsumerRatingRead])
async def get_consumer_ratings(repo: ConsumerRatingRepo):
    return repo.get_all()


@router.get("/{student_id}/ratings", response_model=list[ConsumerRatingRead])
async def get_student_ratings(repo: ConsumerRatingRepo, student_id: int):
    return repo.get_for_student(student_id)


@router.get("/{student_id}/ratings/{rating_id}", response_model=ConsumerRatingRead)
async def get_student_rating(repo: ConsumerRatingRepo, student_id: int, rating_id: int):
    consumer_rating = repo.get_by_id(rating_id)
    if consumer_rating is None or consumer_rating.student_id != student_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Consumer rating not found.")
    return consumer_rating


@router.get("/vendor/{vendor_id}/ratings", response_model=list[ConsumerRatingRead])
async def get_consumer_ratings_for_vendor(repo: ConsumerRatingRepo, vendor_id: int):
    return repo.get_for_vendor(vendor_id)


@router.post("/{student_id}/ratings", response_model=ConsumerRatingRead, status_code=status.HTTP_201_CREATED)
async def create_consumer_rating(repo: ConsumerRatingRepo, student_id: int, rating_data: ConsumerRatingCreate):
    if rating_data.student_id != student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Request student_id must match the route student_id.",
        )
    return repo.create(rating_data)


@router.patch("/{student_id}/ratings/{rating_id}", response_model=ConsumerRatingRead)
async def update_consumer_rating(repo: ConsumerRatingRepo, student_id: int, rating_id: int, rating_data: ConsumerRatingUpdate):
    consumer_rating = repo.get_by_id(rating_id)
    if consumer_rating is None or consumer_rating.student_id != student_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Consumer rating not found.")
    return repo.update(consumer_rating, rating_data)


@router.delete("/{student_id}/ratings/{rating_id}")
async def delete_consumer_rating(repo: ConsumerRatingRepo, student_id: int, rating_id: int):
    consumer_rating = repo.get_by_id(rating_id)
    if consumer_rating is None or consumer_rating.student_id != student_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Consumer rating not found.")

    repo.delete(consumer_rating)
    return {"message": "Consumer rating deleted successfully."}

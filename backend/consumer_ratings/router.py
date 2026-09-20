from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from consumer_ratings.repository import ConsumerRatingRepository
from consumer_ratings.schemas import (
    ConsumerRatingAverage,
    ConsumerRatingCreate,
    ConsumerRatingRead,
    ConsumerRatingUpdate,
)
from database import get_db

router = APIRouter(prefix="/consumer-ratings", tags=["Consumer Ratings"])


def get_consumer_rating_repository(db: Session = Depends(get_db)) -> ConsumerRatingRepository:
    return ConsumerRatingRepository(db)


Repo = Annotated[ConsumerRatingRepository, Depends(get_consumer_rating_repository)]


@router.get("", response_model=list[ConsumerRatingRead])
def list_consumer_ratings(
    repo: Repo,
    student_id: int | None = None,
    vendor_id: int | None = None,
    search: str | None = None,
    sort: str | None = None,
) -> list[ConsumerRatingRead]:
    ratings = repo.list_reviews(
        student_id=student_id,
        vendor_id=vendor_id,
        search=search,
        sort=sort,
    )
    return [ConsumerRatingRead.model_validate(rating) for rating in ratings]


@router.get("/average", response_model=ConsumerRatingAverage)
def get_consumer_rating_average(student_id: int, repo: Repo) -> ConsumerRatingAverage:
    average, count = repo.average_for_student(student_id)
    return ConsumerRatingAverage(student_id=student_id, average=average, count=count)


@router.get("/{rating_id}", response_model=ConsumerRatingRead)
def get_consumer_rating(rating_id: int, repo: Repo) -> ConsumerRatingRead:
    rating = repo.get_by_id(rating_id)
    if rating is None:
        raise HTTPException(status_code=404, detail="Consumer rating not found")
    return ConsumerRatingRead.model_validate(rating)


@router.post("", response_model=ConsumerRatingRead, status_code=201)
def create_consumer_rating(data: ConsumerRatingCreate, repo: Repo) -> ConsumerRatingRead:
    return ConsumerRatingRead.model_validate(repo.create(data))


@router.patch("/{rating_id}", response_model=ConsumerRatingRead)
def update_consumer_rating(
    rating_id: int, data: ConsumerRatingUpdate, repo: Repo
) -> ConsumerRatingRead:
    rating = repo.get_by_id(rating_id)
    if rating is None:
        raise HTTPException(status_code=404, detail="Consumer rating not found")
    return ConsumerRatingRead.model_validate(repo.update(rating, data))


@router.delete("/{rating_id}", status_code=204)
def delete_consumer_rating(rating_id: int, repo: Repo) -> None:
    rating = repo.get_by_id(rating_id)
    if rating is None:
        raise HTTPException(status_code=404, detail="Consumer rating not found")
    repo.delete(rating)

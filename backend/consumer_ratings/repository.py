from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from consumer_ratings.models import ConsumerRating
from consumer_ratings.schemas import ConsumerRatingCreate, ConsumerRatingUpdate
from database import get_db


class ConsumerRatingRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, rating_id: int) -> ConsumerRating | None:
        return self.db.get(ConsumerRating, rating_id)

    def get_all(self) -> list[ConsumerRating]:
        return list(self.db.scalars(select(ConsumerRating)).all())

    def get_for_vendor(self, vendor_id: int) -> list[ConsumerRating]:
        return list(self.db.scalars(select(ConsumerRating).where(ConsumerRating.vendor_id == vendor_id)).all())

    def get_for_student(self, student_id: int) -> list[ConsumerRating]:
        return list(self.db.scalars(select(ConsumerRating).where(ConsumerRating.student_id == student_id)).all())

    def create(self, data: ConsumerRatingCreate) -> ConsumerRating:
        consumer_rating = ConsumerRating(**data.model_dump())
        self.db.add(consumer_rating)
        self.db.commit()
        self.db.refresh(consumer_rating)
        return consumer_rating

    def update(self, consumer_rating: ConsumerRating, data: ConsumerRatingUpdate) -> ConsumerRating:
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(consumer_rating, field, value)
        self.db.commit()
        self.db.refresh(consumer_rating)
        return consumer_rating

    def delete(self, consumer_rating: ConsumerRating) -> None:
        self.db.delete(consumer_rating)
        self.db.commit()


async def get_consumer_rating_repo(db: Session = Depends(get_db)) -> ConsumerRatingRepository:
    return ConsumerRatingRepository(db)

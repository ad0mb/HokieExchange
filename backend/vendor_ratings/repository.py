from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from database import get_db
from vendor_ratings.models import VendorRating
from vendor_ratings.schemas import VendorRatingCreate, VendorRatingUpdate


class VendorRatingRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, rating_id: int) -> VendorRating | None:
        return self.db.get(VendorRating, rating_id)

    def get_all(self) -> list[VendorRating]:
        return list(self.db.scalars(select(VendorRating)).all())

    def get_for_vendor(self, vendor_id: int) -> list[VendorRating]:
        return list(self.db.scalars(select(VendorRating).where(VendorRating.vendor_id == vendor_id)).all())

    def get_for_student(self, student_id: int) -> list[VendorRating]:
        return list(self.db.scalars(select(VendorRating).where(VendorRating.student_id == student_id)).all())

    def create(self, data: VendorRatingCreate) -> VendorRating:
        vendor_rating = VendorRating(**data.model_dump())
        self.db.add(vendor_rating)
        self.db.commit()
        self.db.refresh(vendor_rating)
        return vendor_rating

    def update(self, vendor_rating: VendorRating, data: VendorRatingUpdate) -> VendorRating:
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(vendor_rating, field, value)
        self.db.commit()
        self.db.refresh(vendor_rating)
        return vendor_rating

    def delete(self, vendor_rating: VendorRating) -> None:
        self.db.delete(vendor_rating)
        self.db.commit()


async def get_vendor_rating_repo(db: Session = Depends(get_db)) -> VendorRatingRepository:
    return VendorRatingRepository(db)

from sqlalchemy import select
from sqlalchemy.orm import Session

from vendor_ratings.models import VendorRating
from vendor_ratings.schemas import VendorRatingCreate, VendorRatingUpdate


class VendorRatingRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, data: VendorRatingCreate) -> VendorRating:
        rating = VendorRating(**data.model_dump())
        self.db.add(rating)
        self.db.commit()
        self.db.refresh(rating)
        return rating

    def get_by_id(self, rating_id: int) -> VendorRating | None:
        return self.db.get(VendorRating, rating_id)

    def get_all(self) -> list[VendorRating]:
        return list(self.db.scalars(select(VendorRating)).all())

    def get_for_vendor(self, vendor_id: int) -> list[VendorRating]:
        statement = select(VendorRating).where(VendorRating.vendor_id == vendor_id)
        return list(self.db.scalars(statement).all())

    def update(self, vendor_rating: VendorRating, data: VendorRatingUpdate) -> VendorRating:
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(vendor_rating, field, value)

        self.db.commit()
        self.db.refresh(vendor_rating)
        return vendor_rating

    def delete(self, vendor_rating: VendorRating) -> None:
        self.db.delete(vendor_rating)
        self.db.commit()

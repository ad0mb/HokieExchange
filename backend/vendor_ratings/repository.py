import decimal

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from students.models import Student
from vendor_ratings.models import VendorRating
from vendor_ratings.schemas import VendorRatingCreate, VendorRatingUpdate
from vendors.models import Vendor


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

    def list_reviews(
        self,
        vendor_id: int | None = None,
        student_id: int | None = None,
        search: str | None = None,
        sort: str | None = None,
    ) -> list[VendorRating]:
        statement = select(VendorRating)
        if vendor_id is not None:
            statement = statement.where(VendorRating.vendor_id == vendor_id)
        if student_id is not None:
            statement = statement.where(VendorRating.student_id == student_id)
        if search:
            statement = (
                statement.join(Vendor, VendorRating.vendor_id == Vendor.vendor_id)
                .join(Student, Vendor.student_id == Student.student_id)
                .where(
                    or_(
                        Student.first_name.ilike(f"%{search}%"),
                        Student.last_name.ilike(f"%{search}%"),
                    )
                )
            )
        if sort == "highest":
            statement = statement.order_by(VendorRating.rating.desc())
        elif sort == "lowest":
            statement = statement.order_by(VendorRating.rating.asc())
        return list(self.db.scalars(statement).all())

    def average_for_vendor(self, vendor_id: int) -> tuple[decimal.Decimal | None, int]:
        count, average = self.db.execute(
            select(func.count(), func.avg(VendorRating.rating)).where(
                VendorRating.vendor_id == vendor_id
            )
        ).one()
        return average, count

    def update(self, vendor_rating: VendorRating, data: VendorRatingUpdate) -> VendorRating:
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(vendor_rating, field, value)

        self.db.commit()
        self.db.refresh(vendor_rating)
        return vendor_rating

    def delete(self, vendor_rating: VendorRating) -> None:
        self.db.delete(vendor_rating)
        self.db.commit()

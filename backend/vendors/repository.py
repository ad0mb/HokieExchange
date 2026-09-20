from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from database import get_db
from vendors.models import Vendor
from vendors.schemas import VendorCreate, VendorUpdate


class VendorRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, vendor_id: int) -> Vendor | None:
        return self.db.get(Vendor, vendor_id)

    def get_all(self) -> list[Vendor]:
        return list(self.db.scalars(select(Vendor)).all())

    def get_by_student_id(self, student_id: int) -> list[Vendor]:
        return list(self.db.scalars(select(Vendor).where(Vendor.student_id == student_id)).all())

    def create(self, data: VendorCreate) -> Vendor:
        vendor = Vendor(**data.model_dump())
        self.db.add(vendor)
        self.db.commit()
        self.db.refresh(vendor)
        return vendor

    def update(self, vendor: Vendor, data: VendorUpdate) -> Vendor:
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(vendor, field, value)

        self.db.commit()
        self.db.refresh(vendor)
        return vendor

    def delete(self, vendor: Vendor) -> None:
        self.db.delete(vendor)
        self.db.commit()


async def get_vendor_repo(db: Session = Depends(get_db)) -> VendorRepository:
    return VendorRepository(db)
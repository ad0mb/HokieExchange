from sqlalchemy import select
from sqlalchemy.orm import Session

from vendors.models import Vendor
from vendors.schemas import VendorUpdate

from fastapi import Depends
from database import get_db

class VendorRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, vendor_id: int) -> Vendor | None:
        return self.db.get(Vendor, vendor_id)

    def get_all(self) -> list[Vendor]:
        return list(self.db.scalars(select(Vendor)).all())

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
import decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from services.models import Service, TimeBlock
from services.schemas import ServiceCreate, ServiceUpdate, TimeBlockCreate, TimeBlockUpdate
from vendor_ratings.models import VendorRating


class ServiceRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, data: ServiceCreate) -> Service:
        service = Service(**data.model_dump())
        self.db.add(service)
        self.db.commit()
        self.db.refresh(service)
        return service

    def get_by_id(self, service_id: int) -> Service | None:
        return self.db.get(Service, service_id)

    def get_all(self) -> list[Service]:
        return list(self.db.scalars(select(Service)).all())

    def list_with_rating(
        self,
        vendor_id: int | None = None,
        search: str | None = None,
        min_price: decimal.Decimal | None = None,
        max_price: decimal.Decimal | None = None,
    ) -> list[tuple[Service, decimal.Decimal | None, int]]:
        rating_subq = (
            select(
                VendorRating.vendor_id,
                func.avg(VendorRating.rating).label("avg_rating"),
                func.count().label("rating_count"),
            )
            .group_by(VendorRating.vendor_id)
            .subquery()
        )
        statement = (
            select(
                Service,
                rating_subq.c.avg_rating,
                func.coalesce(rating_subq.c.rating_count, 0),
            )
            .outerjoin(rating_subq, Service.vendor_id == rating_subq.c.vendor_id)
        )
        if vendor_id is not None:
            statement = statement.where(Service.vendor_id == vendor_id)
        if search:
            statement = statement.where(Service.service_name.ilike(f"%{search}%"))
        if min_price is not None:
            statement = statement.where(Service.price >= min_price)
        if max_price is not None:
            statement = statement.where(Service.price <= max_price)
        statement = statement.order_by(Service.service_id)
        return list(self.db.execute(statement).all())

    def update(self, service: Service, data: ServiceUpdate) -> Service:
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(service, field, value)

        self.db.commit()
        self.db.refresh(service)
        return service

    def delete(self, service: Service) -> None:
        self.db.delete(service)
        self.db.commit()


class TimeBlockRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, data: TimeBlockCreate) -> TimeBlock:
        time_block = TimeBlock(**data.model_dump())
        self.db.add(time_block)
        self.db.commit()
        self.db.refresh(time_block)
        return time_block

    def get_by_id(self, time_block_id: int) -> TimeBlock | None:
        return self.db.get(TimeBlock, time_block_id)

    def get_all(self) -> list[TimeBlock]:
        return list(self.db.scalars(select(TimeBlock)).all())

    def get_for_service(self, service_id: int) -> list[TimeBlock]:
        statement = select(TimeBlock).where(TimeBlock.service_id == service_id)
        return list(self.db.scalars(statement).all())

    def update(self, time_block: TimeBlock, data: TimeBlockUpdate) -> TimeBlock:
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(time_block, field, value)

        self.db.commit()
        self.db.refresh(time_block)
        return time_block

    def delete(self, time_block: TimeBlock) -> None:
        self.db.delete(time_block)
        self.db.commit()

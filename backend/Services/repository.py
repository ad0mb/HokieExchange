from sqlalchemy import select
from sqlalchemy.orm import Session

from Services.models import Service, TimeBlock
from Services.schemas import ServiceUpdate, TimeBlockUpdate


class ServiceRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, service_id: int) -> Service | None:
        return self.db.get(Service, service_id)

    def get_all(self) -> list[Service]:
        return list(self.db.scalars(select(Service)).all())

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

    def get_by_id(self, config_id: int) -> TimeBlock | None:
        return self.db.get(TimeBlock, config_id)

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

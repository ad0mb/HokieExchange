from sqlalchemy import select
from sqlalchemy.orm import Session

from services.models import Service, TimeBlock, TimeBlockConfig
from services.schemas import ServiceUpdate, TimeBlockConfigUpdate, TimeBlockUpdate


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


class TimeBlockConfigRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, config_id: int) -> TimeBlockConfig | None:
        return self.db.get(TimeBlockConfig, config_id)

    def get_for_service(self, service_id: int) -> list[TimeBlockConfig]:
        statement = select(TimeBlockConfig).where(TimeBlockConfig.service_id == service_id)
        return list(self.db.scalars(statement).all())

    def update(self, time_block_config: TimeBlockConfig, data: TimeBlockConfigUpdate) -> TimeBlockConfig:
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(time_block_config, field, value)

        self.db.commit()
        self.db.refresh(time_block_config)
        return time_block_config

    def delete(self, time_block_config: TimeBlockConfig) -> None:
        self.db.delete(time_block_config)
        self.db.commit()


class TimeBlockRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, time_block_id: int) -> TimeBlock | None:
        return self.db.get(TimeBlock, time_block_id)

    def get_all(self) -> list[TimeBlock]:
        return list(self.db.scalars(select(TimeBlock)).all())

    def get_for_config(self, config_id: int) -> list[TimeBlock]:
        statement = select(TimeBlock).where(TimeBlock.config_id == config_id)
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

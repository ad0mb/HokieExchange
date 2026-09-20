from sqlalchemy import select
from sqlalchemy.orm import Session

from services.models import Service, TimeBlock, TimeBlockConfig
from services.schemas import ServiceCreate, ServiceUpdate, TimeBlockConfigUpdate, TimeBlockUpdate

from fastapi import Depends
from database import get_db


class ServiceRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, data: ServiceCreate) -> Service:
        service = Service(**data.model_dump(exclude={"time_block_configs"}))
        self.db.add(service)
        self.db.flush()

        for config_data in data.time_block_configs or []:
            config = TimeBlockConfig(**config_data.model_dump(exclude={"time_blocks"}, exclude_none=True))
            config.service_id = service.service_id
            self.db.add(config)
            self.db.flush()

            for block_data in config_data.time_blocks or []:
                block = TimeBlock(**block_data.model_dump(exclude_none=True))
                block.config_id = config.config_id
                self.db.add(block)

        self.db.commit()
        self.db.refresh(service)
        return service

    def get_by_id(self, service_id: int) -> Service | None:
        return self.db.get(Service, service_id)

    def get_by_vendor_id(self, vendor_id: int) -> list[Service]:
        statement = select(Service).where(Service.vendor_id == vendor_id)
        return list(self.db.scalars(statement).all())

    def get_all(self) -> list[Service]:
        return list(self.db.scalars(select(Service)).all())

    def update(self, service: Service, data: ServiceUpdate) -> Service:
        payload = data.model_dump(exclude_unset=True)

        for field, value in payload.items():
            if field in {"time_block_configs", "time_blocks"}:
                continue
            setattr(service, field, value)

        if "time_block_configs" in payload and payload["time_block_configs"] is not None:
            for config_update in payload["time_block_configs"]:
                config_id = config_update.get("config_id")
                config = None
                if config_id is not None:
                    config = self.db.get(TimeBlockConfig, config_id)
                if config is None and service.service_id is not None:
                    config = TimeBlockConfig(service_id=service.service_id)
                    self.db.add(config)
                    self.db.flush()

                if config is None:
                    continue

                for field, value in config_update.items():
                    if field in {"config_id", "time_blocks"}:
                        continue
                    setattr(config, field, value)

                if config_update.get("time_blocks") is not None:
                    for block_update in config_update["time_blocks"]:
                        block_id = block_update.get("time_block_id")
                        block = self.db.get(TimeBlock, block_id) if block_id is not None else None
                        if block is None:
                            block = TimeBlock(config_id=config.config_id)
                            self.db.add(block)
                            self.db.flush()
                        for field, value in block_update.items():
                            if field == "time_block_id":
                                continue
                            setattr(block, field, value)

        if "time_blocks" in payload and payload["time_blocks"] is not None:
            for block_update in payload["time_blocks"]:
                block_id = block_update.get("time_block_id")
                block = self.db.get(TimeBlock, block_id) if block_id is not None else None
                if block is None:
                    config_id = block_update.get("config_id")
                    if config_id is None:
                        continue
                    block = TimeBlock(config_id=config_id)
                    self.db.add(block)
                    self.db.flush()
                for field, value in block_update.items():
                    if field == "time_block_id":
                        continue
                    setattr(block, field, value)

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


async def get_service_repo(db: Session = Depends(get_db)) -> ServiceRepository:
    return ServiceRepository(db)


async def get_time_block_config_repo(db: Session = Depends(get_db)) -> TimeBlockConfigRepository:
    return TimeBlockConfigRepository(db)


async def get_time_block_repo(db: Session = Depends(get_db)) -> TimeBlockRepository:
    return TimeBlockRepository(db)
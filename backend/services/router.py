import datetime
import decimal
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from appointments.repository import AppointmentRepository
from database import get_db
from services.repository import ServiceRepository, TimeBlockRepository
from services.schemas import (
    AvailabilitySlot,
    ServiceCreate,
    ServiceRead,
    ServiceUpdate,
    ServiceWithRating,
    TimeBlockCreate,
    TimeBlockRead,
    TimeBlockUpdate,
)

router = APIRouter(prefix="/services", tags=["Services"])


def get_service_repository(db: Session = Depends(get_db)) -> ServiceRepository:
    return ServiceRepository(db)


def get_time_block_repository(db: Session = Depends(get_db)) -> TimeBlockRepository:
    return TimeBlockRepository(db)


def get_appointment_repository(db: Session = Depends(get_db)) -> AppointmentRepository:
    return AppointmentRepository(db)


ServiceRepo = Annotated[ServiceRepository, Depends(get_service_repository)]
BlockRepo = Annotated[TimeBlockRepository, Depends(get_time_block_repository)]
AppointmentRepo = Annotated[AppointmentRepository, Depends(get_appointment_repository)]


@router.get("", response_model=list[ServiceWithRating])
def list_services(
    repo: ServiceRepo,
    vendor_id: int | None = None,
    search: str | None = None,
    category: str | None = None,
    min_price: decimal.Decimal | None = None,
    max_price: decimal.Decimal | None = None,
) -> list[ServiceWithRating]:
    rows = repo.list_with_rating(
        vendor_id=vendor_id,
        search=search,
        category=category,
        min_price=min_price,
        max_price=max_price,
    )
    return [
        ServiceWithRating(
            service_id=service.service_id,
            vendor_id=service.vendor_id,
            service_name=service.service_name,
            description=service.description,
            location=service.location,
            category=service.category,
            price=service.price,
            duration=service.duration,
            rating=avg_rating,
            rating_count=rating_count,
            date_created=service.date_created,
            date_updated=service.date_updated,
        )
        for service, avg_rating, rating_count in rows
    ]


@router.get("/{service_id}", response_model=ServiceRead)
def get_service(service_id: int, repo: ServiceRepo) -> ServiceRead:
    service = repo.get_by_id(service_id)
    if service is None:
        raise HTTPException(status_code=404, detail="Service not found")
    return ServiceRead.model_validate(service)


@router.post("", response_model=ServiceRead, status_code=201)
def create_service(data: ServiceCreate, repo: ServiceRepo) -> ServiceRead:
    return ServiceRead.model_validate(repo.create(data))


@router.patch("/{service_id}", response_model=ServiceRead)
def update_service(service_id: int, data: ServiceUpdate, repo: ServiceRepo) -> ServiceRead:
    service = repo.get_by_id(service_id)
    if service is None:
        raise HTTPException(status_code=404, detail="Service not found")
    return ServiceRead.model_validate(repo.update(service, data))


@router.delete("/{service_id}", status_code=204)
def delete_service(service_id: int, repo: ServiceRepo) -> None:
    service = repo.get_by_id(service_id)
    if service is None:
        raise HTTPException(status_code=404, detail="Service not found")
    repo.delete(service)


@router.get("/{service_id}/blocks", response_model=list[TimeBlockRead])
def list_time_blocks(service_id: int, block_repo: BlockRepo) -> list[TimeBlockRead]:
    blocks = block_repo.get_for_service(service_id)
    return [TimeBlockRead.model_validate(block) for block in blocks]


@router.post("/{service_id}/blocks", response_model=TimeBlockRead, status_code=201)
def create_time_block(service_id: int, data: TimeBlockCreate, block_repo: BlockRepo) -> TimeBlockRead:
    data.service_id = service_id
    return TimeBlockRead.model_validate(block_repo.create(data))


@router.get("/{service_id}/availability", response_model=list[AvailabilitySlot])
def get_availability(
    service_id: int,
    block_repo: BlockRepo,
    appointment_repo: AppointmentRepo,
    days: int = 14,
) -> list[AvailabilitySlot]:
    blocks = [block for block in block_repo.get_for_service(service_id) if block.status == "available"]
    appointments = appointment_repo.get_for_service(service_id)
    booked = {(appointment.time_block_id, appointment.booked_at) for appointment in appointments}

    now = datetime.datetime.now()
    slots: list[AvailabilitySlot] = []
    for block in blocks:
        today = now.date()
        for offset in range(days):
            day = today + datetime.timedelta(days=offset)
            if day.weekday() != block.day_of_week:
                continue
            occurrence = datetime.datetime.combine(day, block.start_time)
            if occurrence < now:
                continue
            slots.append(
                AvailabilitySlot(
                    time_block_id=block.time_block_id,
                    day_of_week=block.day_of_week,
                    start_time=block.start_time,
                    datetime=occurrence,
                    available=(block.time_block_id, occurrence) not in booked,
                )
            )
    return slots

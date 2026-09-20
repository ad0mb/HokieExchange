from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from appointments.repository import AppointmentRepository
from appointments.schemas import AppointmentCreate, AppointmentRead, AppointmentUpdate
from database import get_db

router = APIRouter(prefix="/appointments", tags=["Appointments"])


def get_appointment_repository(db: Session = Depends(get_db)) -> AppointmentRepository:
    return AppointmentRepository(db)


Repo = Annotated[AppointmentRepository, Depends(get_appointment_repository)]


@router.get("", response_model=list[AppointmentRead])
def list_appointments(
    repo: Repo,
    student_id: int | None = None,
    vendor_id: int | None = None,
) -> list[AppointmentRead]:
    if student_id is not None:
        appointments = repo.get_for_student(student_id)
    elif vendor_id is not None:
        appointments = repo.get_for_vendor(vendor_id)
    else:
        appointments = repo.get_all()
    return [AppointmentRead.model_validate(appointment) for appointment in appointments]


@router.get("/{appointment_id}", response_model=AppointmentRead)
def get_appointment(appointment_id: int, repo: Repo) -> AppointmentRead:
    appointment = repo.get_by_id(appointment_id)
    if appointment is None:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return AppointmentRead.model_validate(appointment)


@router.post("", response_model=AppointmentRead, status_code=201)
def create_appointment(data: AppointmentCreate, repo: Repo) -> AppointmentRead:
    try:
        appointment = repo.create(data)
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error))
    except IntegrityError:
        repo.db.rollback()
        raise HTTPException(status_code=409, detail="Time slot is already booked")
    return AppointmentRead.model_validate(appointment)


@router.patch("/{appointment_id}", response_model=AppointmentRead)
def update_appointment(appointment_id: int, data: AppointmentUpdate, repo: Repo) -> AppointmentRead:
    appointment = repo.get_by_id(appointment_id)
    if appointment is None:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return AppointmentRead.model_validate(repo.update(appointment, data))


@router.delete("/{appointment_id}", status_code=204)
def delete_appointment(appointment_id: int, repo: Repo) -> None:
    appointment = repo.get_by_id(appointment_id)
    if appointment is None:
        raise HTTPException(status_code=404, detail="Appointment not found")
    repo.delete(appointment)

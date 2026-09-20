from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from appointments.models import Appointment
from appointments.schemas import AppointmentCreate, AppointmentUpdate
from services.models import Service, TimeBlock


class AppointmentRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, data: AppointmentCreate) -> Appointment:
        time_block = self.db.get(TimeBlock, data.time_block_id)
        if time_block is None:
            raise ValueError("Time block not found")
        service = self.db.get(Service, time_block.service_id)
        if service is None:
            raise ValueError("Service not found")

        appointment = Appointment(
            time_block_id=data.time_block_id,
            booked_at=data.booked_at,
            student_id=data.student_id,
            status=data.status,
            price_at_booking=service.price,
            cancel_reason=data.cancel_reason,
            cancelled_at=data.cancelled_at,
            completed_at=data.completed_at,
        )
        self.db.add(appointment)
        self.db.commit()
        self.db.refresh(appointment)
        return appointment

    def get_by_id(self, appointment_id: int) -> Appointment | None:
        return self.db.get(
            Appointment,
            appointment_id,
            options=[joinedload(Appointment.time_block).joinedload(TimeBlock.service)],
        )

    def get_all(self) -> list[Appointment]:
        statement = select(Appointment).options(
            joinedload(Appointment.time_block).joinedload(TimeBlock.service)
        )
        return list(self.db.scalars(statement).all())

    def get_for_student(self, student_id: int) -> list[Appointment]:
        statement = (
            select(Appointment)
            .where(Appointment.student_id == student_id)
            .options(joinedload(Appointment.time_block).joinedload(TimeBlock.service))
        )
        return list(self.db.scalars(statement).all())

    def get_for_time_block(self, time_block_id: int) -> list[Appointment]:
        statement = select(Appointment).where(Appointment.time_block_id == time_block_id)
        return list(self.db.scalars(statement).all())

    def get_for_service(self, service_id: int) -> list[Appointment]:
        statement = (
            select(Appointment)
            .join(TimeBlock, Appointment.time_block_id == TimeBlock.time_block_id)
            .where(TimeBlock.service_id == service_id)
        )
        return list(self.db.scalars(statement).all())

    def get_for_vendor(self, vendor_id: int) -> list[Appointment]:
        statement = (
            select(Appointment)
            .join(TimeBlock, Appointment.time_block_id == TimeBlock.time_block_id)
            .join(Service, TimeBlock.service_id == Service.service_id)
            .where(Service.vendor_id == vendor_id)
            .options(joinedload(Appointment.time_block).joinedload(TimeBlock.service))
        )
        return list(self.db.scalars(statement).all())

    def update(self, appointment: Appointment, data: AppointmentUpdate) -> Appointment:
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(appointment, field, value)

        self.db.commit()
        self.db.refresh(appointment)
        return appointment

    def delete(self, appointment: Appointment) -> None:
        self.db.delete(appointment)
        self.db.commit()

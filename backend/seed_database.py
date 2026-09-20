"""Populate the live development database with connected synthetic records."""

import datetime
import decimal
import os
import secrets
import sys

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, configure_mappers

import model_registry  # noqa: F401
from appointments.models import Appointment
from consumer_ratings.models import ConsumerRating
from items.models import Item
from services.models import Service, TimeBlock
from students.models import Student
from vendor_ratings.models import VendorRating
from vendors.models import Vendor


def seed_database(db: Session) -> dict[str, int]:
    """Insert a connected synthetic data set into every live database table."""
    sso_start = 1_000_000_000 + secrets.randbelow(900_000_000)
    run_label = f"[HOKIE_EXCHANGE_SEED_{sso_start}]"

    students = [
        Student(first_name="Alice", last_name="Hokie", graduation_year=2027, sso_id=sso_start),
        Student(first_name="Bob", last_name="Hokie", graduation_year=2028, sso_id=sso_start + 1),
        Student(first_name="Carol", last_name="Hokie", graduation_year=2029, sso_id=sso_start + 2),
    ]
    db.add_all(students)
    db.flush()

    vendors = [
        Vendor(student_id=students[0].student_id, description=f"{run_label} Campus barber services"),
        Vendor(student_id=students[1].student_id, description=f"{run_label} Laundry and errand support"),
    ]
    db.add_all(vendors)
    db.flush()

    services = [
        Service(
            vendor_id=vendors[0].vendor_id,
            service_name="Synthetic Haircut",
            description=f"{run_label} 30-minute haircut",
            location="Squires Student Center",
            category="haircut",
            price=decimal.Decimal("20.00"),
            duration=datetime.time(0, 30),
        ),
        Service(
            vendor_id=vendors[1].vendor_id,
            service_name="Synthetic Laundry Pickup",
            description=f"{run_label} Laundry pickup and return",
            location="Main Campus",
            category="cleaning",
            price=decimal.Decimal("10.00"),
            duration=datetime.time(1, 0),
        ),
        Service(
            vendor_id=vendors[1].vendor_id,
            service_name="Synthetic Food Pickup",
            description=f"{run_label} Dining-hall pickup",
            location="Drillfield",
            category="food",
            price=decimal.Decimal("5.00"),
            duration=datetime.time(0, 20),
        ),
    ]
    db.add_all(services)
    db.flush()

    items = [
        Item(vendor_id=vendors[0].vendor_id, item_name="Synthetic Textbook", description=f"{run_label} Used calculus textbook", price=40, stock=2),
        Item(vendor_id=vendors[1].vendor_id, item_name="Synthetic Mini Fridge", description=f"{run_label} Dorm mini fridge", price=85, stock=1),
    ]
    db.add_all(items)
    db.flush()

    time_blocks = [
        TimeBlock(service_id=services[0].service_id, day_of_week=0, start_time=datetime.time(10, 0), status="available"),
        TimeBlock(service_id=services[0].service_id, day_of_week=0, start_time=datetime.time(11, 0), status="available"),
        TimeBlock(service_id=services[2].service_id, day_of_week=2, start_time=datetime.time(12, 0), status="available"),
    ]
    db.add_all(time_blocks)
    db.flush()

    # One completed appointment (backing the verified ratings) and one active booking.
    appointments = [
        Appointment(
            time_block_id=time_blocks[0].time_block_id,
            booked_at=datetime.datetime(2026, 9, 21, 10, 0),
            student_id=students[1].student_id,
            status="complete",
            price_at_booking=services[0].price,
            completed_at=datetime.datetime(2026, 9, 21, 10, 30),
        ),
        Appointment(
            time_block_id=time_blocks[1].time_block_id,
            booked_at=datetime.datetime(2026, 9, 28, 11, 0),
            student_id=students[2].student_id,
            status="active",
            price_at_booking=services[0].price,
        ),
    ]
    db.add_all(appointments)
    db.flush()

    consumer_ratings = [
        ConsumerRating(
            vendor_id=vendors[0].vendor_id,
            student_id=students[1].student_id,
            rating=5,
            appointment_id=appointments[0].appointment_id,
        ),
    ]
    vendor_ratings = [
        VendorRating(
            student_id=students[1].student_id,
            vendor_id=vendors[0].vendor_id,
            rating=5,
            description=f"{run_label} Great haircut",
            appointment_id=appointments[0].appointment_id,
        ),
    ]
    db.add_all(consumer_ratings + vendor_ratings)
    db.commit()

    return {
        "students": len(students),
        "vendors": len(vendors),
        "services": len(services),
        "items": len(items),
        "time_blocks": len(time_blocks),
        "appointments": len(appointments),
        "consumer_ratings": len(consumer_ratings),
        "vendor_ratings": len(vendor_ratings),
    }


def main() -> int:
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL is required. Do not add it to a tracked file.")
    configure_mappers()
    engine = create_engine(database_url, pool_pre_ping=True)
    try:
        with Session(engine) as db:
            counts = seed_database(db)
        print(f"Seeded live database: {counts}")
        return 0
    finally:
        engine.dispose()


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as error:
        print(f"FAIL: {error}", file=sys.stderr)
        raise SystemExit(1)

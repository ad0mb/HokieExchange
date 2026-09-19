"""Populate the live development database with connected synthetic records.

Set DATABASE_URL before running. This script intentionally commits synthetic
HokieExchange records so the API and repository integration tests have data.
"""

import datetime
import os
import secrets
import sys

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, configure_mappers

import model_registry  # noqa: F401  # Registers every feature model with SQLAlchemy.
from Services.models import Service, TimeBlock
from Students.models import Student
from Vendors.models import Vendor


def seed_database(db: Session) -> dict[str, int]:
    """Insert three students, two vendors, three services, and three time blocks."""
    # Keep generated SSO IDs within a signed MySQL INTEGER range and extremely
    # unlikely to collide with existing records.
    sso_start = 1_000_000_000 + secrets.randbelow(900_000_000)
    run_label = f"[HOKIE_EXCHANGE_SEED_{sso_start}]"

    students = [
        Student(first_name=101, last_name=201, graduation_year=2027, sso_id=sso_start),
        Student(first_name=102, last_name=202, graduation_year=2028, sso_id=sso_start + 1),
        Student(first_name=103, last_name=203, graduation_year=2029, sso_id=sso_start + 2),
    ]
    db.add_all(students)
    db.flush()

    vendors = [
        Vendor(student_id=students[0].student_id, description=f"{run_label} Campus barber and grooming services"),
        Vendor(student_id=students[1].student_id, description=f"{run_label} Laundry and errand support"),
    ]
    db.add_all(vendors)
    db.flush()

    services = [
        Service(
            vendor_id=vendors[0].vendor_id,
            service_name="Synthetic Haircut",
            description=f"{run_label} A 30-minute campus haircut appointment",
            location="Squires Student Center",
            schedule_type="per-block",
        ),
        Service(
            vendor_id=vendors[1].vendor_id,
            service_name="Synthetic Laundry Pickup",
            description=f"{run_label} Laundry pickup and return service",
            location="Main Campus",
            schedule_type="on-demand",
        ),
        Service(
            vendor_id=vendors[1].vendor_id,
            service_name="Synthetic Food Pickup",
            description=f"{run_label} Dining-hall pickup service",
            location="Drillfield",
            schedule_type="per-block",
        ),
    ]
    db.add_all(services)
    db.flush()

    time_blocks = [
        TimeBlock(
            service_id=services[0].service_id,
            duration=datetime.time(0, 30),
            price=20,
        ),
        TimeBlock(
            service_id=services[0].service_id,
            duration=datetime.time(0, 30),
            price=20,
        ),
        TimeBlock(
            service_id=services[2].service_id,
            duration=datetime.time(0, 20),
            price=5,
        ),
    ]
    db.add_all(time_blocks)
    db.commit()

    return {
        "students": len(students),
        "vendors": len(vendors),
        "services": len(services),
        "time_blocks": len(time_blocks),
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
        print(
            "Seeded live database — "
            f"students: {counts['students']}, vendors: {counts['vendors']}, "
            f"services: {counts['services']}, time blocks: {counts['time_blocks']}"
        )
        return 0
    finally:
        engine.dispose()


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as error:
        print(f"FAIL: {error}", file=sys.stderr)
        raise SystemExit(1)

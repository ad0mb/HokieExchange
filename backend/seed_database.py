"""Populate the live development database with connected synthetic records."""

import datetime
import os
import secrets
import sys

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, configure_mappers

import model_registry  # noqa: F401
from consumer_ratings.models import ConsumerRating
from services.models import Service, TimeBlock, TimeBlockConfig
from students.models import Student
from vendor_ratings.models import VendorRating
from vendors.models import Vendor


def seed_database(db: Session) -> dict[str, int]:
    """Insert a connected synthetic data set into every live database table."""
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
        Vendor(student_id=students[0].student_id, description=f"{run_label} Campus barber services"),
        Vendor(student_id=students[1].student_id, description=f"{run_label} Laundry and errand support"),
    ]
    db.add_all(vendors)
    db.flush()
    services = [
        Service(vendor_id=vendors[0].vendor_id, service_name="Synthetic Haircut", description=f"{run_label} 30-minute haircut", location="Squires Student Center", schedule_type="per-block"),
        Service(vendor_id=vendors[1].vendor_id, service_name="Synthetic Laundry Pickup", description=f"{run_label} Laundry pickup and return", location="Main Campus", schedule_type="on-demand"),
        Service(vendor_id=vendors[1].vendor_id, service_name="Synthetic Food Pickup", description=f"{run_label} Dining-hall pickup", location="Drillfield", schedule_type="per-block"),
    ]
    db.add_all(services)
    db.flush()
    time_block_configs = [
        TimeBlockConfig(service_id=services[0].service_id, duration=datetime.time(0, 30), price=20),
        TimeBlockConfig(service_id=services[2].service_id, duration=datetime.time(0, 20), price=5),
    ]
    db.add_all(time_block_configs)
    db.flush()
    time_blocks = [
        TimeBlock(config_id=time_block_configs[0].config_id, start_time=datetime.datetime(2026, 9, 21, 10, 0)),
        TimeBlock(config_id=time_block_configs[0].config_id, start_time=datetime.datetime(2026, 9, 21, 11, 0)),
        TimeBlock(config_id=time_block_configs[1].config_id, start_time=datetime.datetime(2026, 9, 21, 12, 0)),
    ]
    consumer_ratings = [
        ConsumerRating(student_id=students[2].student_id, vendor_id=vendors[0].vendor_id, rating=5),
        ConsumerRating(student_id=students[2].student_id, vendor_id=vendors[1].vendor_id, rating=4),
    ]
    vendor_ratings = [
        VendorRating(student_id=students[2].student_id, vendor_id=vendors[0].vendor_id, rating=5, description=f"{run_label} Reliable customer"),
        VendorRating(student_id=students[2].student_id, vendor_id=vendors[1].vendor_id, rating=4, description=f"{run_label} Easy pickup coordination"),
    ]
    db.add_all(time_blocks + consumer_ratings + vendor_ratings)
    db.commit()
    return {
        "students": len(students), "vendors": len(vendors), "services": len(services),
        "time_block_configs": len(time_block_configs), "time_blocks": len(time_blocks),
        "consumer_ratings": len(consumer_ratings), "vendor_ratings": len(vendor_ratings),
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

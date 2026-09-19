"""Live-database integration check for the feature repositories.

Set DATABASE_URL before running. The test uses existing database rows only.
Repository updates and deletes are executed inside transactions that are rolled
back, so no database changes remain after a successful or failed test run.
"""

import decimal
import os
import sys
from typing import Any

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, configure_mappers

import model_registry  # noqa: F401  # Registers every feature model with SQLAlchemy.
from Services.repository import ServiceRepository, TimeBlockRepository
from Services.schemas import ServiceUpdate, TimeBlockUpdate
from Students.repository import StudentRepository
from Students.schemas import StudentUpdate
from Vendors.repository import VendorRepository
from Vendors.schemas import VendorUpdate


class RollbackOnlySession(Session):
    """Makes repository commits flush SQL without permanently committing it."""

    def commit(self) -> None:
        self.flush()


def require_database_url() -> str:
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL is required. Do not add it to a tracked file.")
    return database_url


def check_repository(
    label: str,
    repository_class: type[Any],
    record_id: int,
    update_data: Any,
    engine: Any,
) -> None:
    """Check get, update, and delete, restoring the live row after each check."""
    db = RollbackOnlySession(bind=engine)
    repository = repository_class(db)
    try:
        record = repository.get_by_id(record_id)
        assert record is not None, f"{label}: expected record {record_id} was not found"

        updated = repository.update(record, update_data)
        assert updated is not None, f"{label}: update returned no record"
        db.rollback()

        record = repository.get_by_id(record_id)
        assert record is not None, f"{label}: rollback did not restore the record"
        repository.delete(record)
        assert repository.get_by_id(record_id) is None, f"{label}: delete did not remove the row"
        db.rollback()

        assert repository.get_by_id(record_id) is not None, f"{label}: rollback did not restore deleted row"
        print(f"PASS: {label} repository")
    finally:
        db.rollback()
        db.close()


def main() -> int:
    configure_mappers()
    engine = create_engine(require_database_url(), pool_pre_ping=True)
    
    try:
        with Session(engine) as db:
            students = StudentRepository(db).get_all()
            vendors = VendorRepository(db).get_all()
            services = ServiceRepository(db).get_all()

        print(
            f"Live rows found — students: {len(students)}, vendors: {len(vendors)}, "
            f"services: {len(services)}"
        )

        if students:
            student = students[0]
            check_repository(
                "Student",
                StudentRepository,
                student.student_id,
                StudentUpdate(graduation_year=student.graduation_year + 1),
                engine,
            )
        else:
            print("SKIP: Student repository (no live student rows)")

        if vendors:
            vendor = vendors[0]
            vendor_description = vendor.description[:970] + " [repository test]"
            check_repository(
                "Vendor",
                VendorRepository,
                vendor.vendor_id,
                VendorUpdate(description=vendor_description),
                engine,
            )
        else:
            print("SKIP: Vendor repository (no live vendor rows)")

        if services:
            service = services[0]
            service_location = (service.location or "")[:230] + " [repository test]"
            check_repository(
                "Service",
                ServiceRepository,
                service.service_id,
                ServiceUpdate(location=service_location),
                engine,
            )

            with Session(engine) as db:
                time_blocks = TimeBlockRepository(db).get_for_service(service.service_id)
            if time_blocks:
                time_block = time_blocks[0]
                check_repository(
                    "TimeBlock",
                    TimeBlockRepository,
                    time_block.config_id,
                    TimeBlockUpdate(price=decimal.Decimal(time_block.price) + decimal.Decimal("1")),
                    engine,
                )
            else:
                print("SKIP: TimeBlock repository (the selected live service has no time blocks)")
        else:
            print("SKIP: Service and TimeBlock repositories (no live service rows)")

        print("All available live repository checks completed; all write operations were rolled back.")
        return 0
    finally:
        engine.dispose()


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as error:
        print(f"FAIL: {error}", file=sys.stderr)
        raise SystemExit(1)

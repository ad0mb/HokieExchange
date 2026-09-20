"""Live database integration checks for every feature repository.

Updates and deletes are flushed then rolled back, so this script preserves the
live data it tests. Run seed_database.py first if a table has no records.
"""

import datetime
import decimal
import os
import sys
from typing import Any

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, configure_mappers

import model_registry  # noqa: F401
from consumer_ratings.repository import ConsumerRatingRepository
from consumer_ratings.schemas import ConsumerRatingUpdate
from items.repository import ItemRepository
from items.schemas import ItemUpdate
from services.repository import ServiceRepository, TimeBlockConfigRepository, TimeBlockRepository
from services.schemas import ServiceUpdate, TimeBlockConfigUpdate, TimeBlockUpdate
from students.repository import StudentRepository
from students.schemas import StudentUpdate
from vendor_ratings.repository import VendorRatingRepository
from vendor_ratings.schemas import VendorRatingUpdate
from vendors.repository import VendorRepository
from vendors.schemas import VendorUpdate


class RollbackOnlySession(Session):
    def commit(self) -> None:
        self.flush()


def check_repository(label: str, repository_class: type[Any], record_id: int, update_data: Any, engine: Any) -> None:
    db = RollbackOnlySession(bind=engine)
    repository = repository_class(db)
    try:
        record = repository.get_by_id(record_id)
        assert record is not None, f"{label}: record was not found"
        repository.update(record, update_data)
        db.rollback()
        record = repository.get_by_id(record_id)
        assert record is not None, f"{label}: update rollback failed"
        repository.delete(record)
        assert repository.get_by_id(record_id) is None, f"{label}: delete failed"
        db.rollback()
        assert repository.get_by_id(record_id) is not None, f"{label}: delete rollback failed"
        print(f"PASS: {label}")
    finally:
        db.rollback()
        db.close()


def main() -> int:
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL is required.")
    configure_mappers()
    engine = create_engine(database_url, pool_pre_ping=True)
    try:
        with Session(engine) as db:
            students = StudentRepository(db).get_all()
            vendors = VendorRepository(db).get_all()
            services = ServiceRepository(db).get_all()
            items = ItemRepository(db).get_all()
            consumer_ratings = ConsumerRatingRepository(db).get_all()
            vendor_ratings = VendorRatingRepository(db).get_all()
            configs = TimeBlockConfigRepository(db).get_for_service(services[0].service_id) if services else []
            time_blocks = TimeBlockRepository(db).get_all()

        checks = [
            ("Student", StudentRepository, students, lambda x: StudentUpdate(graduation_year=x.graduation_year + 1)),
            ("Vendor", VendorRepository, vendors, lambda x: VendorUpdate(description=x.description[:970] + " [test]")),
            ("Service", ServiceRepository, services, lambda x: ServiceUpdate(location=(x.location or "")[:240] + " [test]")),
            ("Item", ItemRepository, items, lambda x: ItemUpdate(stock=x.stock + 1)),
            ("TimeBlockConfig", TimeBlockConfigRepository, configs, lambda x: TimeBlockConfigUpdate(price=decimal.Decimal(x.price) + 1)),
            ("TimeBlock", TimeBlockRepository, time_blocks, lambda x: TimeBlockUpdate(start_time=x.start_time + datetime.timedelta(minutes=1))),
            ("ConsumerRating", ConsumerRatingRepository, consumer_ratings, lambda x: ConsumerRatingUpdate(rating=decimal.Decimal(x.rating) + 1)),
            ("VendorRating", VendorRatingRepository, vendor_ratings, lambda x: VendorRatingUpdate(description=(x.description or "")[:990] + " [test]")),
        ]
        for label, repository_class, records, make_update in checks:
            if records:
                check_repository(label, repository_class, records[0].__mapper__.primary_key_from_instance(records[0])[0], make_update(records[0]), engine)
            else:
                print(f"SKIP: {label} (no live rows)")
        return 0
    finally:
        engine.dispose()


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as error:
        print(f"FAIL: {error}", file=sys.stderr)
        raise SystemExit(1)

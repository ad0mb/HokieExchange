from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.orm import Session

import model_registry  # noqa: F401  # Registers every feature model with SQLAlchemy.
from consumer_ratings.repository import ConsumerRatingRepository
from consumer_ratings.schemas import ConsumerRatingRead
from services.repository import ServiceRepository, TimeBlockConfigRepository, TimeBlockRepository
from services.schemas import ServiceRead, TimeBlockConfigRead, TimeBlockRead
from students.repository import StudentRepository
from students.schemas import StudentRead
from vendors.repository import VendorRepository
from vendors.schemas import VendorRead
from vendor_ratings.repository import VendorRatingRepository
from vendor_ratings.schemas import VendorRatingRead
from database import get_db

app = FastAPI()


@app.get("/")
def root():
    return {"message": "Welcome to HokieExchange!"}


@app.get("/examples/repository-preview")
def repository_preview(db: Session = Depends(get_db)):
    """Reference-only example of repository read operations.

    This endpoint is intentionally not a production API design. It shows how a
    router receives `db`, constructs repositories, and returns Pydantic models.
    """
    student_repository = StudentRepository(db)
    vendor_repository = VendorRepository(db)
    service_repository = ServiceRepository(db)
    time_block_config_repository = TimeBlockConfigRepository(db)
    time_block_repository = TimeBlockRepository(db)
    consumer_rating_repository = ConsumerRatingRepository(db)
    vendor_rating_repository = VendorRatingRepository(db)

    # get_all() examples
    students = student_repository.get_all()
    vendors = vendor_repository.get_all()
    services = service_repository.get_all()
    time_blocks = time_block_repository.get_all()
    consumer_ratings = consumer_rating_repository.get_all()
    vendor_ratings = vendor_rating_repository.get_all()

    if not students or not vendors or not services:
        raise HTTPException(
            status_code=404,
            detail="This reference endpoint needs at least one student, vendor, and service.",
        )

    # get_by_id() examples
    student = student_repository.get_by_id(students[0].student_id)
    vendor = vendor_repository.get_by_id(vendors[0].vendor_id)
    service = service_repository.get_by_id(services[0].service_id)

    if not student or not vendor or not service:
        raise HTTPException(status_code=404, detail="A selected database record was not found.")

    # TimeBlockConfigRepository's collection and single-record read methods.
    time_block_configs = time_block_config_repository.get_for_service(service.service_id)
    time_block_config = (
        time_block_config_repository.get_by_id(time_block_configs[0].config_id)
        if time_block_configs
        else None
    )
    first_time_block = time_block_repository.get_by_id(time_blocks[0].time_block_id) if time_blocks else None
    time_blocks_for_config = (
        time_block_repository.get_for_config(time_block_config.config_id)
        if time_block_config
        else []
    )
    first_consumer_rating = (
        consumer_rating_repository.get_by_id(consumer_ratings[0].rating_id)
        if consumer_ratings
        else None
    )
    consumer_ratings_for_vendor = consumer_rating_repository.get_for_vendor(vendor.vendor_id)
    first_vendor_rating = (
        vendor_rating_repository.get_by_id(vendor_ratings[0].rating_id)
        if vendor_ratings
        else None
    )
    vendor_ratings_for_vendor = vendor_rating_repository.get_for_vendor(vendor.vendor_id)

    # update() and delete() are intentionally excluded: a GET endpoint must
    # never change database state. Demonstrate those in PATCH and DELETE routes.
    return {
        "available_read_methods": {
            "students": ["get_all", "get_by_id"],
            "vendors": ["get_all", "get_by_id"],
            "services": ["get_all", "get_by_id"],
            "time_block_configs": ["get_for_service", "get_by_id"],
            "time_blocks": ["get_all", "get_by_id", "get_for_config"],
            "consumer_ratings": ["get_all", "get_by_id", "get_for_vendor"],
            "vendor_ratings": ["get_all", "get_by_id", "get_for_vendor"],
        },
        "student": StudentRead.model_validate(student),
        "vendor": VendorRead.model_validate(vendor),
        "service": ServiceRead.model_validate(service),
        "time_block_configs": [
            TimeBlockConfigRead.model_validate(config) for config in time_block_configs
        ],
        "first_time_block_config": (
            TimeBlockConfigRead.model_validate(time_block_config) if time_block_config else None
        ),
        "first_time_block": TimeBlockRead.model_validate(first_time_block) if first_time_block else None,
        "time_blocks_for_first_config": [
            TimeBlockRead.model_validate(block) for block in time_blocks_for_config
        ],
        "first_consumer_rating": (
            ConsumerRatingRead.model_validate(first_consumer_rating)
            if first_consumer_rating
            else None
        ),
        "consumer_ratings_for_first_vendor": [
            ConsumerRatingRead.model_validate(rating) for rating in consumer_ratings_for_vendor
        ],
        "first_vendor_rating": (
            VendorRatingRead.model_validate(first_vendor_rating) if first_vendor_rating else None
        ),
        "vendor_ratings_for_first_vendor": [
            VendorRatingRead.model_validate(rating) for rating in vendor_ratings_for_vendor
        ],
    }

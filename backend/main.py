from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.orm import Session

import model_registry  # noqa: F401  # Registers every feature model with SQLAlchemy.
from Services.repository import ServiceRepository, TimeBlockRepository
from Services.schemas import ServiceRead, TimeBlockRead
from Students.repository import StudentRepository
from Students.schemas import StudentRead
from Vendors.repository import VendorRepository
from Vendors.schemas import VendorRead
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
    time_block_repository = TimeBlockRepository(db)

    # get_all() examples
    students = student_repository.get_all()
    vendors = vendor_repository.get_all()
    services = service_repository.get_all()

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

    # TimeBlockRepository's collection and single-record read methods.
    time_blocks = time_block_repository.get_for_service(service.service_id)
    time_block = (
        time_block_repository.get_by_id(time_blocks[0].config_id) if time_blocks else None
    )

    # update() and delete() are intentionally excluded: a GET endpoint must
    # never change database state. Demonstrate those in PATCH and DELETE routes.
    return {
        "student": StudentRead.model_validate(student),
        "vendor": VendorRead.model_validate(vendor),
        "service": ServiceRead.model_validate(service),
        "time_blocks": [TimeBlockRead.model_validate(block) for block in time_blocks],
        "first_time_block": TimeBlockRead.model_validate(time_block) if time_block else None,
    }

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from services.repository import ServiceRepository, get_service_repo
from services.schemas import ServiceRead
from vendors.repository import VendorRepository, get_vendor_repo
from vendors.schemas import VendorCreate, VendorRead, VendorUpdate

router = APIRouter(prefix="/vendors", tags=["Vendors"])

VendorRepo = Annotated[VendorRepository, Depends(get_vendor_repo)]
ServiceRepo = Annotated[ServiceRepository, Depends(get_service_repo)]


@router.get("/", response_model=list[VendorRead])
async def recommended_vendors(
    repo: VendorRepo,
    page_length: Annotated[int, Query(ge=1, le=100)] = 10,
    page_number: Annotated[int, Query(ge=1)] = 1,
):
    vendors = repo.get_all()
    start = (page_number - 1) * page_length
    end = start + page_length
    return vendors[start:end]


@router.get("/{vendor_id}", response_model=VendorRead)
async def get_vendor(repo: VendorRepo, vendor_id: int):
    vendor = repo.get_by_id(vendor_id)
    if vendor is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor not found.")
    return vendor


@router.post("/", response_model=VendorRead, status_code=status.HTTP_201_CREATED)
async def create_vendor(repo: VendorRepo, vendor_data: VendorCreate):
    existing_vendor_profiles = repo.get_by_student_id(vendor_data.student_id)
    if existing_vendor_profiles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This student already has a vendor profile.",
        )

    return repo.create(vendor_data)


@router.patch("/{vendor_id}", response_model=VendorRead)
async def update_vendor(repo: VendorRepo, vendor_id: int, vendor_data: VendorUpdate):
    vendor = repo.get_by_id(vendor_id)
    if vendor is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor not found.")
    return repo.update(vendor, vendor_data)


@router.delete("/{vendor_id}")
async def delete_vendor(repo: VendorRepo, vendor_id: int):
    vendor = repo.get_by_id(vendor_id)
    if vendor is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor not found.")

    repo.delete(vendor)
    return {"message": "Vendor profile deleted successfully."}


@router.get("/{vendor_id}/services")
async def get_vendor_services(srepo: ServiceRepo, repo: VendorRepo, vendor_id: int):
    vendor = repo.get_by_id(vendor_id)
    if vendor is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor not found.")

    services = []
    for service in srepo.get_by_vendor_id(vendor_id) or []:
        config_payloads = []
        all_time_blocks = []

        for config in getattr(service, "time_block_configs", []) or []:
            time_blocks = []
            for block in getattr(config, "time_blocks", []) or []:
                block_payload = {
                    "time_block_id": block.time_block_id,
                    "config_id": block.config_id,
                    "start_time": block.start_time,
                    "date_created": block.date_created,
                    "date_updated": block.date_updated,
                }
                time_blocks.append(block_payload)
                all_time_blocks.append(block_payload)

            config_payload = {
                "config_id": config.config_id,
                "service_id": config.service_id,
                "duration": config.duration,
                "price": config.price,
                "date_created": config.date_created,
                "date_updated": config.date_updated,
                "time_blocks": time_blocks,
            }
            config_payloads.append(config_payload)

        service_payload = {
            "service_id": service.service_id,
            "vendor_id": service.vendor_id,
            "service_name": service.service_name,
            "description": service.description,
            "location": service.location,
            "schedule_type": service.schedule_type,
            "date_created": service.date_created,
            "date_updated": service.date_updated,
            "time_blocks": all_time_blocks,
            "time_block_configs": config_payloads,
            "time_block_config": config_payloads[0] if config_payloads else None,
        }
        services.append(ServiceRead.model_validate(service_payload))

    return services
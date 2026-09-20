from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from services.models import Service
from services.repository import ServiceRepository, get_service_repo
from services.schemas import ServiceCategory, ServiceCreate, ServiceRead, ServiceUpdate

router = APIRouter(prefix="/services", tags=["Services"])

ServiceRepo = Annotated[ServiceRepository, Depends(get_service_repo)]


@router.get("/{service_id}")
async def get_service(repo: ServiceRepo, service_id: int):
    service = repo.get_by_id(service_id)
    if service is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found.")
    return service


@router.get("/search")
async def get_vendor_services(
    repo: ServiceRepo,
    category: ServiceCategory | None = None,
    vendor_id: int | None = None,
    location: str | None = None,
    page_number: Annotated[int, Query(ge=1)] = 1,
    page_length: Annotated[int, Query(ge=1, le=100)] = 20,
):
    services = repo.get_all()

    if vendor_id is not None:
        services = [service for service in services if service.vendor_id == vendor_id]
    if category is not None:
        services = [service for service in services if service.schedule_type == category.value]
    if location is not None:
        services = [service for service in services if (service.location or "").lower() == location.lower()]

    start = (page_number - 1) * page_length
    end = start + page_length
    return services[start:end]


@router.post("/", response_model=ServiceRead, status_code=status.HTTP_201_CREATED)
async def create_service_listing(repo: ServiceRepo, service_data: ServiceCreate):
    return repo.create(service_data)


@router.delete("/{service_id}")
async def delete_service(repo: ServiceRepo, service_id: int):
    service = repo.get_by_id(service_id)
    if service is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found.")

    repo.delete(service)
    return {"message": "Service deleted successfully."}


@router.patch("/{service_id}")
async def update_service(repo: ServiceRepo, service_id: int, service_data: ServiceUpdate):
    service = repo.get_by_id(service_id)
    if service is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found.")

    updated_service = repo.update(service, service_data)
    return updated_service
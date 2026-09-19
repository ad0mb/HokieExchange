from enum import StrEnum

from repository import VendorRepository
from repository import get_vendor_repo

from fastapi import APIRouter, Query, Depends
from typing import Annotated

router = APIRouter(
    prefix="/vendors",
    tags=["Vendors"]
)

Repo = Annotated[VendorRepository, Depends(get_vendor_repo)]

# for now, just a list of the vendors in alphabetical order
# ideally it will get top/popular/recommended vendors
# paginated
@router.get("/")
async def recommended_vendors(
    repo: Repo,
    page_length: Annotated[int, Query(min_length=1),] = 10,
    page_number: Annotated[int, Query(min_length=1),] = 1,
):
    return repo.get_all()


# returns the profile of a specific vendor, not the listings
@router.get("/{vendor_id}")
async def get_vendor(repo: Repo, vendor_id: int):
    return repo.get_by_id(vendor_id)

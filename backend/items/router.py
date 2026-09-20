from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from items.repository import ItemRepository
from items.schemas import ItemCreate, ItemRead, ItemUpdate

router = APIRouter(prefix="/items", tags=["Items"])


def get_item_repository(db: Session = Depends(get_db)) -> ItemRepository:
    return ItemRepository(db)


Repo = Annotated[ItemRepository, Depends(get_item_repository)]


@router.get("/", response_model=list[ItemRead])
def list_items(repo: Repo, vendor_id: int | None = None) -> list[ItemRead]:
    items = repo.get_for_vendor(vendor_id) if vendor_id is not None else repo.get_all()
    return [ItemRead.model_validate(item) for item in items]


@router.get("/{item_id}", response_model=ItemRead)
def get_item(item_id: int, repo: Repo) -> ItemRead:
    item = repo.get_by_id(item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return ItemRead.model_validate(item)


@router.post("/", response_model=ItemRead, status_code=201)
def create_item(data: ItemCreate, repo: Repo) -> ItemRead:
    return ItemRead.model_validate(repo.create(data))


@router.patch("/{item_id}", response_model=ItemRead)
def update_item(item_id: int, data: ItemUpdate, repo: Repo) -> ItemRead:
    item = repo.get_by_id(item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return ItemRead.model_validate(repo.update(item, data))


@router.delete("/{item_id}", status_code=204)
def delete_item(item_id: int, repo: Repo) -> None:
    item = repo.get_by_id(item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    repo.delete(item)

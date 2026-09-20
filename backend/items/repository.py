from sqlalchemy import select
from sqlalchemy.orm import Session

from items.models import Item
from items.schemas import ItemCreate, ItemUpdate


class ItemRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, data: ItemCreate) -> Item:
        item = Item(**data.model_dump())
        self.db.add(item)
        self.db.commit()
        self.db.refresh(item)
        return item

    def get_by_id(self, item_id: int) -> Item | None:
        return self.db.get(Item, item_id)

    def get_all(self) -> list[Item]:
        return list(self.db.scalars(select(Item)).all())

    def get_for_vendor(self, vendor_id: int) -> list[Item]:
        statement = select(Item).where(Item.vendor_id == vendor_id)
        return list(self.db.scalars(statement).all())

    def update(self, item: Item, data: ItemUpdate) -> Item:
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(item, field, value)

        self.db.commit()
        self.db.refresh(item)
        return item

    def delete(self, item: Item) -> None:
        self.db.delete(item)
        self.db.commit()

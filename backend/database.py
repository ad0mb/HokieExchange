import os
from collections.abc import Generator
from functools import lru_cache

from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker


class Base(DeclarativeBase):
    """Shared SQLAlchemy declarative base for every database table."""


@lru_cache
def get_engine() -> Engine:
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL must be set before using database endpoints.")

    return create_engine(database_url, pool_pre_ping=True)


def get_db() -> Generator[Session, None, None]:
    """Provide one SQLAlchemy session to a FastAPI request."""
    session_factory = sessionmaker(bind=get_engine())
    with session_factory() as db:
        yield db

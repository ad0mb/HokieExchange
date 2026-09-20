import os
from collections.abc import Generator
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

# Single canonical env file at the repo root, shared with the frontend.
load_dotenv(Path(__file__).resolve().parent.parent / ".env")


class Base(DeclarativeBase):
    """Shared SQLAlchemy declarative base for every database table."""


@lru_cache
def get_engine() -> Engine:
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL must be set before using database endpoints.")

    return create_engine(database_url, pool_pre_ping=True)


@lru_cache
def get_session_factory() -> sessionmaker[Session]:
    return sessionmaker(bind=get_engine())


def get_db() -> Generator[Session, None, None]:
    """Provide one SQLAlchemy session to a FastAPI request."""
    with get_session_factory()() as db:
        yield db

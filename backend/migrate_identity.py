"""Run once: uv run python migrate_identity.py. Preserves all existing records."""
from sqlalchemy import text

import model_registry  # noqa: F401
from database import get_engine
from identity.models import GoogleIdentity


def column_exists(connection, table: str, column: str) -> bool:
    return connection.execute(text(
        "SELECT COUNT(*) FROM information_schema.COLUMNS "
        "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :t AND COLUMN_NAME = :c"
    ), {"t": table, "c": column}).scalar() > 0


def index_exists(connection, index: str) -> bool:
    return connection.execute(text(
        "SELECT COUNT(*) FROM information_schema.STATISTICS "
        "WHERE TABLE_SCHEMA = DATABASE() AND INDEX_NAME = :i"
    ), {"i": index}).scalar() > 0


if __name__ == "__main__":
    engine = get_engine()
    with engine.begin() as connection:
        connection.execute(text("ALTER TABLE students MODIFY graduation_year INT NULL"))
        if not column_exists(connection, "students", "email"):
            connection.execute(text("ALTER TABLE students ADD COLUMN email VARCHAR(320) NULL"))
        if not index_exists(connection, "students_email_uq"):
            connection.execute(text("CREATE UNIQUE INDEX students_email_uq ON students (email)"))
    GoogleIdentity.__table__.create(engine, checkfirst=True)
    print("Google identity mapping is ready.")

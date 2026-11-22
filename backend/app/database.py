"""SQLAlchemy database engine and session management (PostgreSQL primary)."""

from __future__ import annotations

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import get_settings, normalize_database_url


class Base(DeclarativeBase):
    """Base ORM declarative model."""


def create_db_engine(database_url: str | None = None) -> Engine:
    url = normalize_database_url(database_url or get_settings().database_url)
    if url.startswith("sqlite"):
        return create_engine(
            url,
            pool_pre_ping=True,
            connect_args={"check_same_thread": False},
        )
    return create_engine(
        url,
        pool_pre_ping=True,
        pool_recycle=300,
    )


engine = create_db_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def configure_database(database_url: str) -> None:
    """Re-bind the global engine and session factory (used in tests)."""
    global engine, SessionLocal
    engine = create_db_engine(database_url)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

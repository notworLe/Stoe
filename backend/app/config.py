"""Application configuration loaded from environment variables."""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
REPO_ROOT = BASE_DIR.parent

# Load root .env automatically when running locally without Docker
load_dotenv(REPO_ROOT / ".env", override=False)


def _default_database_url() -> str:
    env_url = os.getenv("DATABASE_URL")
    if env_url:
        return env_url
    pg_user = os.getenv("POSTGRES_USER", "notworle")
    pg_password = os.getenv("POSTGRES_PASSWORD", "123123123")
    pg_host = os.getenv("POSTGRES_HOST", "localhost")
    pg_port = os.getenv("POSTGRES_PORT", "5432")
    pg_db = os.getenv("POSTGRES_DB", "stoe")
    return f"postgresql+psycopg://{pg_user}:{pg_password}@{pg_host}:{pg_port}/{pg_db}"


@dataclass(frozen=True)
class Settings:
    database_url: str = field(default_factory=_default_database_url)
    cors_origins: list[str] = field(
        default_factory=lambda: [
            origin.strip()
            for origin in os.getenv(
                "CORS_ORIGINS",
                "http://localhost:3000,http://127.0.0.1:3000",
            ).split(",")
            if origin.strip()
        ]
    )
    admin_email: str = field(
        default_factory=lambda: os.getenv("ADMIN_EMAIL", "admin@maisondelua.com.au")
    )
    admin_password: str = field(
        default_factory=lambda: os.getenv("ADMIN_PASSWORD", "admin123")
    )
    jwt_secret: str = field(
        default_factory=lambda: os.getenv(
            "JWT_SECRET", "maison-de-lua-dev-secret-change-in-production"
        )
    )
    token_ttl_hours: int = field(
        default_factory=lambda: int(os.getenv("TOKEN_TTL_HOURS", "24"))
    )
    smtp_host: str = field(default_factory=lambda: os.getenv("SMTP_HOST", ""))
    smtp_port: int = field(default_factory=lambda: int(os.getenv("SMTP_PORT", "587")))
    smtp_user: str = field(default_factory=lambda: os.getenv("SMTP_USER", ""))
    smtp_password: str = field(default_factory=lambda: os.getenv("SMTP_PASSWORD", ""))
    smtp_from: str = field(
        default_factory=lambda: os.getenv("SMTP_FROM", "hello@maisondelua.com.au")
    )
    upload_dir: Path = field(
        default_factory=lambda: Path(os.getenv("UPLOAD_DIR", str(BASE_DIR / "uploads")))
    )


def get_settings() -> Settings:
    return Settings()

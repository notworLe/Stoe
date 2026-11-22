"""FastAPI entry point for Maison de Lua Ao Dai Rental Platform."""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app import database
from app.config import get_settings
from app.routers import admin, auth, public
from app.seed import seed_database


@asynccontextmanager
async def lifespan(_: FastAPI):
    settings = get_settings()
    settings.upload_dir.mkdir(parents=True, exist_ok=True)
    database.Base.metadata.create_all(bind=database.engine)
    db = database.SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield


def create_app() -> FastAPI:
    settings = get_settings()
    settings.upload_dir.mkdir(parents=True, exist_ok=True)

    application = FastAPI(
        title="Maison de Lua API",
        description="Editorial Vietnamese Ao Dai Rental Backend — Melbourne, Australia (AUD)",
        version="1.0.0",
        lifespan=lifespan,
    )

    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    application.mount(
        "/uploads",
        StaticFiles(directory=str(settings.upload_dir)),
        name="uploads",
    )

    application.include_router(public.router)
    application.include_router(auth.router)
    application.include_router(admin.router)

    @application.get("/", tags=["Health"])
    async def root() -> dict[str, str]:
        return {
            "service": "Maison de Lua API",
            "status": "ok",
            "currency": "AUD",
        }

    @application.get("/health", tags=["Health"])
    async def health() -> dict[str, str]:
        return {"status": "healthy"}

    return application


app = create_app()

"""Media storage service: uploads to Supabase Storage in production, local disk in dev."""

from __future__ import annotations

import secrets

import httpx
from fastapi import HTTPException, status

from app.config import Settings

MIME_BY_EXTENSION: dict[str, str] = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
}


async def upload_media_bytes(
    content: bytes,
    ext: str,
    settings: Settings,
) -> tuple[str, str, str]:
    """Store validated image bytes and return (public_url, filename, storage_provider)."""
    unique_name = f"{secrets.token_hex(8)}{ext}"
    content_type = MIME_BY_EXTENSION.get(ext, "application/octet-stream")

    if settings.supabase_url and settings.supabase_service_role_key:
        bucket = settings.supabase_storage_bucket or "maison-de-lua-media"
        upload_endpoint = (
            f"{settings.supabase_url}/storage/v1/object/{bucket}/{unique_name}"
        )
        headers = {
            "Authorization": f"Bearer {settings.supabase_service_role_key}",
            "apikey": settings.supabase_service_role_key,
            "Content-Type": content_type,
            "x-upsert": "true",
        }
        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                response = await client.post(
                    upload_endpoint,
                    content=content,
                    headers=headers,
                )
        except httpx.HTTPError as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Could not reach Supabase Storage to upload image.",
            ) from exc

        if response.status_code not in (200, 201):
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=(
                    f"Supabase Storage rejected upload (HTTP {response.status_code}). "
                    f"Verify bucket '{bucket}' exists and is configured as public."
                ),
            )

        public_url = (
            f"{settings.supabase_url}/storage/v1/object/public/{bucket}/{unique_name}"
        )
        return public_url, unique_name, "supabase"

    # Local filesystem fallback when Supabase Storage env vars are not set
    settings.upload_dir.mkdir(parents=True, exist_ok=True)
    dest = settings.upload_dir / unique_name
    dest.write_bytes(content)
    return f"/uploads/{unique_name}", unique_name, "local"

"""Admin authentication endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AdminUser
from app.schemas import AdminUserResponse, LoginRequest, LoginResponse
from app.security import create_access_token, get_current_admin, verify_password

router = APIRouter(prefix="/api/v1/auth", tags=["Auth"])


@router.post("/login", response_model=LoginResponse)
def admin_login(payload: LoginRequest, db: Session = Depends(get_db)) -> LoginResponse:
    admin = (
        db.query(AdminUser)
        .filter(AdminUser.email == str(payload.email).strip().lower())
        .first()
    )
    if admin is None or not verify_password(payload.password, admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    token = create_access_token(admin)
    return LoginResponse(
        access_token=token,
        admin=AdminUserResponse.model_validate(admin),
    )


@router.get("/me", response_model=AdminUserResponse)
def admin_me(current_admin: AdminUser = Depends(get_current_admin)) -> AdminUser:
    return current_admin

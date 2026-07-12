from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserResponse
from app.api.deps import RoleChecker

router = APIRouter(prefix="/admin", tags=["Admin"])

# ── Shared role guard: admin-only ──────────────────────────────────────────────
_admin_only = RoleChecker(["admin"])


@router.get("/users", response_model=List[UserResponse])
async def list_all_users(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(_admin_only),
):
    """Admin: returns every registered user account with id, email, and role."""
    result = await db.execute(select(User).order_by(User.id))
    users = result.scalars().all()
    return users


@router.put("/users/{user_id}/role", response_model=UserResponse)
async def update_user_role(
    user_id: int,
    new_role: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(_admin_only),
):
    """Admin: promotes or demotes a user to a new role (employee | admin)."""
    allowed_roles = {"employee", "admin"}
    if new_role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role '{new_role}'. Accepted values: {sorted(allowed_roles)}",
        )

    result = await db.execute(select(User).where(User.id == user_id))
    target_user = result.scalar_one_or_none()

    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} not found.",
        )

    # Prevent an admin from demoting themselves to avoid lockout
    if target_user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Administrators cannot modify their own role.",
        )

    target_user.role = new_role
    await db.commit()
    await db.refresh(target_user)

    print(f"[ADMIN] {current_user.email} updated user {target_user.email} -> role: {new_role}")
    return target_user

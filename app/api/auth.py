import sys
import os
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

# Synchronize runtime path context
BASE_DIR = r"C:\Users\Rudra\OneDrive\Desktop\Management System\NexDesk-Smart-Workspace-Management-System"
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)

from app.db.session import get_db
from app.models.user import User
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(email: str, password: str, role: str = "employee", db: AsyncSession = Depends(get_db)):
    """Registers a fresh employee or admin persona into the system after checking duplicates."""
    # Check if the user already exists
    result = await db.execute(select(User).where(User.email == email))
    existing_user = result.scalar_one_or_none()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address is already registered in the NexDesk infrastructure."
        )
    
    # Securely hash password and build database instance
    hashed_pass = get_password_hash(password)
    new_user = User(email=email, hashed_password=hashed_pass, role=role)
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    return {"message": "User account created successfully", "user_id": new_user.id, "email": new_user.email}

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    """Validates user credentials against stored bcrypt values and returns a signed JWT."""
    result = await db.execute(select(User).where(User.email == form_data.username))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or secure password profile match.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Sign tokens for authenticated sessions
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(subject=user.email, expires_delta=access_token_expires)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role
    }
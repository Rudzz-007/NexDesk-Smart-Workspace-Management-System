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
async def signup(
    email: str, 
    password: str, 
    role: str = "employee", 
    full_name: str | None = None,
    company_name: str | None = None,
    usage_type: str | None = None,
    db: AsyncSession = Depends(get_db)
):
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
    new_user = User(
        email=email, 
        hashed_password=hashed_pass, 
        role=role,
        full_name=full_name,
        company_name=company_name,
        usage_type=usage_type
    )
    
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

from pydantic import BaseModel

class GoogleAuthRequest(BaseModel):
    id_token: str

@router.post("/google")
async def google_auth(request: GoogleAuthRequest, db: AsyncSession = Depends(get_db)):
    """Verifies a Google ID token and authenticates or registers the user."""
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google OAuth is not configured on the server."
        )

    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests as google_requests
        import secrets

        # Verify token using Google's public keys
        idinfo = id_token.verify_oauth2_token(
            request.id_token, 
            google_requests.Request(), 
            settings.GOOGLE_CLIENT_ID
        )
        
        email = idinfo.get("email")
        if not email:
            raise ValueError("Token does not contain an email address")
            
        if not idinfo.get("email_verified"):
            raise ValueError("Google account email is not verified.")
            
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        
        if not user:
            # Create a new user with a random unguessable password
            random_pass = secrets.token_urlsafe(32)
            hashed_pass = get_password_hash(random_pass)
            user = User(email=email, hashed_password=hashed_pass, role="employee")
            db.add(user)
            await db.commit()
            await db.refresh(user)
            
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(subject=user.email, expires_delta=access_token_expires)
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "role": user.role
        }

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Google ID token: {str(e)}"
        )

class ForgotPasswordRequest(BaseModel):
    email: str

@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    """
    Handles forgot password requests securely by returning a generic message regardless 
    of whether the email exists, preventing user enumeration attacks.
    """
    # 1. Look up the user
    result = await db.execute(select(User).where(User.email == request.email.strip()))
    user = result.scalar_one_or_none()
    
    # 2. Only if the user exists, we would actually trigger the reset email behind the scenes.
    if user:
        # TODO: Integrate real email sending logic here (e.g. via Celery/SendGrid)
        # For now, we simulate sending the email securely.
        print(f"SECURITY EVENT: Password reset token generated for valid user {user.email}")
        pass
    
    # 3. Always return the exact same generic response.
    return {"message": "If an account exists with this email, a reset link has been sent."}
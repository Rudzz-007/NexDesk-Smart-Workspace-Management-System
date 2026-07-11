import sys
import os
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

# Synchronize path context
BASE_DIR = r"C:\Users\Rudra\OneDrive\Desktop\Management System\NexDesk-Smart-Workspace-Management-System"
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)

from app.db.session import get_db
from app.models.user import User
from app.core.config import settings

# Point the token extractor to our login route destination
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

async def get_current_user(
    db: AsyncSession = Depends(get_db), 
    token: str = Depends(oauth2_scheme)
) -> User:
    """Decodes incoming JWT payloads and injects the authenticated User record context."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate active session credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decode the signed JWT payload parameters
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    # Query the database to ensure the user still exists
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    
    if user is None:
        raise credentials_exception
        
    return user

from typing import List

class RoleChecker:
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: Your account privileges are insufficient for this operation."
            )
        return current_user
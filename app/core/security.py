import sys
import os
import bcrypt
from datetime import datetime, timedelta, timezone
from typing import Any, Union
from jose import jwt

# Force runtime path synchronization
BASE_DIR = r"C:\Users\Rudra\OneDrive\Desktop\Management System\NexDesk-Smart-Workspace-Management-System"
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)

from app.core.config import settings

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a raw incoming string against the stored database bcrypt hash."""
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

def get_password_hash(password: str) -> str:
    """Generates a secure one-way cryptographic hash of a raw password string."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def create_access_token(subject: Union[str, Any], expires_delta: timedelta = None) -> str:
    """Generates a cryptographically signed JWT for client authentication state."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt
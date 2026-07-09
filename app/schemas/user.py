from pydantic import BaseModel, EmailStr, Field
from typing import Optional

# Properties required during User Signup
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters")
    role: Optional[str] = "employee"

# Properties returned to the client safely (never reveal the password hash!)
class UserResponse(BaseModel):
    id: int
    email: EmailStr
    role: str

    model_config = {"from_attributes": True}

# Login Token Payload structure
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
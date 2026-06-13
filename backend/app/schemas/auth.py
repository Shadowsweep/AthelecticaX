from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters long")
    first_name: str = Field(..., min_length=2, max_length=60)
    last_name: str = Field(..., min_length=1, max_length=60)
    department: str = Field(..., min_length=2, max_length=100)
    designation: str = Field(default="Employee", min_length=2, max_length=100)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse
    approval_status: Optional[str] = None

class TokenRefreshRequest(BaseModel):
    refresh_token: str

from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2)
    institution: Optional[str] = None
    field_of_study: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    institution: Optional[str] = None
    field_of_study: Optional[str] = None
    preferred_explanation_level: Optional[str] = "intermediate"
    citation_style: Optional[str] = "IEEE"
    default_summary_length: Optional[str] = "detailed"
    default_export_format: Optional[str] = "pdf"

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    institution: Optional[str] = None
    field_of_study: Optional[str] = None
    preferred_explanation_level: str
    citation_style: str
    default_summary_length: str
    default_export_format: str
    created_at: datetime

    model_config = {"from_attributes": True}

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

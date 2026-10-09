from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import create_access_token
from app.models.user import User
from app.schemas.user import UserRegister, UserLogin, UserResponse, UserProfileUpdate, TokenResponse
from app.services.auth_service import register_user, authenticate_user, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    user = register_user(db, user_data)
    token = create_access_token(data={"sub": user.id, "email": user.email})
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.post("/login", response_model=TokenResponse)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, login_data)
    token = create_access_token(data={"sub": user.id, "email": user.email})
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.get("/me", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserResponse)
def update_profile(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if profile_data.full_name is not None:
        current_user.full_name = profile_data.full_name
    if profile_data.institution is not None:
        current_user.institution = profile_data.institution
    if profile_data.field_of_study is not None:
        current_user.field_of_study = profile_data.field_of_study
    if profile_data.preferred_explanation_level is not None:
        current_user.preferred_explanation_level = profile_data.preferred_explanation_level
    if profile_data.citation_style is not None:
        current_user.citation_style = profile_data.citation_style
    if profile_data.default_summary_length is not None:
        current_user.default_summary_length = profile_data.default_summary_length
    if profile_data.default_export_format is not None:
        current_user.default_export_format = profile_data.default_export_format

    db.commit()
    db.refresh(current_user)
    return current_user

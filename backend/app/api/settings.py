from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.config import settings
from app.core.database import get_db
from app.models.user import User
from app.models.paper import ResearchPaper
from app.models.literature import LiteratureReview
from app.models.note import UserNote
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/settings", tags=["Settings & System"])

@router.get("/status")
def get_system_status(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Returns AI Provider status, Demo Mode status, and user storage metrics without exposing keys."""
    has_groq = bool(settings.GROQ_API_KEY)
    has_openai = bool(settings.OPENAI_API_KEY)

    active_provider = settings.AI_PROVIDER
    if settings.DEMO_MODE or (not has_groq and not has_openai):
        active_provider = "demo"

    # Count user metrics for dashboard
    total_papers = db.query(func.count(ResearchPaper.id)).filter(ResearchPaper.user_id == current_user.id).scalar() or 0
    total_reviews = db.query(func.count(LiteratureReview.id)).filter(LiteratureReview.user_id == current_user.id).scalar() or 0
    total_notes = db.query(func.count(UserNote.id)).filter(UserNote.user_id == current_user.id).scalar() or 0

    return {
        "app_name": settings.APP_NAME,
        "environment": settings.ENVIRONMENT,
        "demo_mode": settings.DEMO_MODE,
        "active_ai_provider": active_provider,
        "groq_configured": has_groq,
        "openai_configured": has_openai,
        "max_file_size_mb": settings.MAX_FILE_SIZE_MB,
        "user_stats": {
            "total_papers": total_papers,
            "total_reviews": total_reviews,
            "total_notes": total_notes
        }
    }

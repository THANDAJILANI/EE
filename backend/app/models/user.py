import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    institution = Column(String(255), nullable=True)
    field_of_study = Column(String(255), nullable=True)

    # Preferences
    preferred_explanation_level = Column(String(50), default="intermediate") # beginner, intermediate, advanced
    citation_style = Column(String(50), default="IEEE") # IEEE, APA, Harvard
    default_summary_length = Column(String(50), default="detailed") # concise, detailed, beginner
    default_export_format = Column(String(50), default="pdf") # pdf, docx, json

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    papers = relationship("ResearchPaper", back_populates="user", cascade="all, delete-orphan")
    literature_reviews = relationship("LiteratureReview", back_populates="user", cascade="all, delete-orphan")
    comparisons = relationship("PaperComparison", back_populates="user", cascade="all, delete-orphan")
    notes = relationship("UserNote", back_populates="user", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="user", cascade="all, delete-orphan")

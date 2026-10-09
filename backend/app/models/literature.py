import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class LiteratureReview(Base):
    __tablename__ = "literature_reviews"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    topic = Column(String(500), nullable=False)
    citation_style = Column(String(50), default="IEEE")

    # Paper IDs included in this review
    paper_ids = Column(JSON, default=list) # List[str]

    # Structured Components
    individual_paper_notes = Column(JSON, default=list) # List of paper summaries relative to topic
    matrix_data = Column(JSON, default=list) # Comparison matrix of selected papers
    thematic_review = Column(Text, nullable=True)
    chronological_review = Column(Text, nullable=True)
    methodology_comparison = Column(Text, nullable=True)
    common_gaps = Column(JSON, default=list) # List[str]
    conflicting_findings = Column(JSON, default=list) # List[str]
    future_directions = Column(JSON, default=list) # List[str]
    draft_review_markdown = Column(Text, nullable=True) # Full structured academic draft

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    # Relationships
    user = relationship("User", back_populates="literature_reviews")
    review_papers = relationship("LiteratureReviewPaper", back_populates="literature_review", cascade="all, delete-orphan")

class LiteratureReviewPaper(Base):
    __tablename__ = "literature_review_papers"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    literature_review_id = Column(String(36), ForeignKey("literature_reviews.id", ondelete="CASCADE"), nullable=False, index=True)
    paper_id = Column(String(36), ForeignKey("research_papers.id", ondelete="CASCADE"), nullable=False, index=True)
    relevance_to_topic = Column(Text, nullable=True)
    specific_notes = Column(Text, nullable=True)

    literature_review = relationship("LiteratureReview", back_populates="review_papers")

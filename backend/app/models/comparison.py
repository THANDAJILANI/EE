import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class PaperComparison(Base):
    __tablename__ = "paper_comparisons"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    paper_ids = Column(JSON, default=list) # List[str]

    # Structured Comparison Data
    comparison_matrix = Column(JSON, default=list) # Matrix rows per paper
    similarities = Column(JSON, default=list) # List of common traits
    differences = Column(JSON, default=list) # Key methodological & conceptual differences
    best_performing_analysis = Column(JSON, default=dict) # Metric comparisons where comparable
    common_weaknesses = Column(JSON, default=list)
    unexplored_opportunities = Column(JSON, default=list)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    user = relationship("User", back_populates="comparisons")

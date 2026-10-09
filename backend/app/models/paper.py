import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class ResearchPaper(Base):
    __tablename__ = "research_papers"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(500), nullable=False, default="Untitled Paper")
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, default=0) # bytes
    page_count = Column(Integer, default=0)
    is_scanned = Column(Boolean, default=False)
    extracted_text = Column(Text, nullable=True) # Full text stored safely for RAG search
    extracted_sections = Column(JSON, nullable=True) # Dict of section name -> text with page boundaries

    processing_status = Column(String(50), default="uploaded", index=True) # uploaded, extracting, analyzing, completed, failed
    error_message = Column(Text, nullable=True)

    is_favorite = Column(Boolean, default=False)
    is_archived = Column(Boolean, default=False)
    personal_label = Column(String(255), nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="papers")
    metadata_rel = relationship("PaperMetadata", back_populates="paper", uselist=False, cascade="all, delete-orphan")
    analysis = relationship("PaperAnalysis", back_populates="paper", uselist=False, cascade="all, delete-orphan")
    tags = relationship("PaperTag", back_populates="paper", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="paper", cascade="all, delete-orphan")
    notes = relationship("UserNote", back_populates="paper", cascade="all, delete-orphan")

class PaperMetadata(Base):
    __tablename__ = "paper_metadata"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    paper_id = Column(String(36), ForeignKey("research_papers.id", ondelete="CASCADE"), unique=True, nullable=False)
    authors = Column(JSON, default=list) # List[str]
    publication_year = Column(Integer, nullable=True)
    journal_or_conference = Column(String(255), nullable=True)
    doi = Column(String(255), nullable=True)
    research_domain = Column(String(255), nullable=True)
    keywords = Column(JSON, default=list) # List[str]
    abstract = Column(Text, nullable=True)

    paper = relationship("ResearchPaper", back_populates="metadata_rel")

class PaperAnalysis(Base):
    __tablename__ = "paper_analyses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    paper_id = Column(String(36), ForeignKey("research_papers.id", ondelete="CASCADE"), unique=True, nullable=False)

    # Executive Summaries
    concise_summary = Column(Text, nullable=True) # ~100 words
    detailed_summary = Column(Text, nullable=True) # ~300 words
    beginner_explanation = Column(Text, nullable=True)
    main_contribution = Column(Text, nullable=True)
    why_it_matters = Column(Text, nullable=True)

    # Detailed Structured Extractions (JSON)
    # { primary_objective, secondary_objectives: [], research_questions: [], hypotheses: [], problem_addressed, research_gap }
    research_objectives = Column(JSON, default=dict)

    # { research_design, dataset: { name, source, size, preprocessing }, algorithms_models: [], tools_frameworks: [], experimental_setup, evaluation_metrics: [], baseline_methods: [], implementation_details, statistical_techniques }
    methodology = Column(JSON, default=dict)

    # { main_findings: [], quantitative_results: [], baseline_comparisons: [], key_tables_results: [], practical_applications: [] }
    results_findings = Column(JSON, default=dict)

    # { author_stated: [], ai_inferred: [{ limitation, evidence_rationale }] }
    limitations = Column(JSON, default=dict)

    # { author_proposed: [], ai_suggested: [] }
    future_scope = Column(JSON, default=dict)

    # { strengths: [], weaknesses: [], novelty_contribution, reproducibility_concerns, dataset_limitations, evaluation_concerns, practical_relevance }
    critical_analysis = Column(JSON, default=dict)

    is_demo_mode = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    paper = relationship("ResearchPaper", back_populates="analysis")

class PaperTag(Base):
    __tablename__ = "paper_tags"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    paper_id = Column(String(36), ForeignKey("research_papers.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    tag_name = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    paper = relationship("ResearchPaper", back_populates="tags")

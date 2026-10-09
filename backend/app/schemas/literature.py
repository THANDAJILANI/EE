from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class LiteratureReviewCreate(BaseModel):
    title: str = Field(..., min_length=3)
    topic: str = Field(..., min_length=3)
    paper_ids: List[str] = Field(..., min_length=1)
    citation_style: Optional[str] = "IEEE"

class IndividualPaperNote(BaseModel):
    paper_id: str
    paper_title: str
    authors_year: str
    research_problem: str
    objectives: str
    methodology: str
    dataset: str
    algorithms: str
    key_results: str
    limitations: str
    research_gap: str
    relevance_to_topic: str

class LiteratureReviewResponse(BaseModel):
    id: str
    title: str
    topic: str
    citation_style: str
    paper_ids: List[str]
    individual_paper_notes: List[Dict[str, Any]]
    matrix_data: List[Dict[str, Any]]
    thematic_review: Optional[str] = None
    chronological_review: Optional[str] = None
    methodology_comparison: Optional[str] = None
    common_gaps: List[str] = []
    conflicting_findings: List[str] = []
    future_directions: List[str] = []
    draft_review_markdown: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}

class LiteratureReviewListItem(BaseModel):
    id: str
    title: str
    topic: str
    paper_count: int
    created_at: datetime

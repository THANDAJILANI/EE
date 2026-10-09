from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class PaperComparisonCreate(BaseModel):
    title: Optional[str] = "Comparative Analysis"
    paper_ids: List[str] = Field(..., min_length=2, max_length=10)

class ComparisonRowSchema(BaseModel):
    paper_id: str
    title: str
    year: Optional[int] = None
    objective: str
    dataset: str
    methodology: str
    algorithms: str
    metrics: str
    main_results: str
    limitations: str
    research_gaps: str

class PaperComparisonResponse(BaseModel):
    id: str
    title: str
    paper_ids: List[str]
    comparison_matrix: List[Dict[str, Any]]
    similarities: List[str]
    differences: List[str]
    best_performing_analysis: Dict[str, Any]
    common_weaknesses: List[str]
    unexplored_opportunities: List[str]
    created_at: datetime

    model_config = {"from_attributes": True}

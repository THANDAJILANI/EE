from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class ResearchObjectivesSchema(BaseModel):
    primary_objective: str = "Not reported in the paper"
    secondary_objectives: List[str] = Field(default_factory=list)
    research_questions: List[str] = Field(default_factory=list)
    hypotheses: List[str] = Field(default_factory=list)
    problem_addressed: str = "Not reported in the paper"
    research_gap: str = "Not reported in the paper"

class DatasetInfoSchema(BaseModel):
    name: str = "Not reported in the paper"
    source: str = "Not reported in the paper"
    size: str = "Not reported in the paper"
    preprocessing: str = "Not reported in the paper"

class MethodologySchema(BaseModel):
    research_design: str = "Not reported in the paper"
    dataset: DatasetInfoSchema = Field(default_factory=DatasetInfoSchema)
    algorithms_models: List[str] = Field(default_factory=list)
    tools_frameworks: List[str] = Field(default_factory=list)
    experimental_setup: str = "Not reported in the paper"
    evaluation_metrics: List[str] = Field(default_factory=list)
    baseline_methods: List[str] = Field(default_factory=list)
    implementation_details: str = "Not reported in the paper"
    statistical_techniques: List[str] = Field(default_factory=list)

class QuantitativeMetricSchema(BaseModel):
    metric_name: str
    value: str
    baseline_value: Optional[str] = None
    comparison_note: Optional[str] = None

class ResultsFindingsSchema(BaseModel):
    main_findings: List[str] = Field(default_factory=list)
    quantitative_results: List[QuantitativeMetricSchema] = Field(default_factory=list)
    comparisons_with_baselines: List[str] = Field(default_factory=list)
    tables_described: List[str] = Field(default_factory=list)
    authors_conclusions: str = "Not reported in the paper"
    practical_applications: List[str] = Field(default_factory=list)

class InferredLimitationSchema(BaseModel):
    limitation: str
    evidence_rationale: str

class LimitationsSchema(BaseModel):
    author_stated: List[str] = Field(default_factory=list)
    ai_inferred: List[InferredLimitationSchema] = Field(default_factory=list)

class FutureScopeSchema(BaseModel):
    author_proposed: List[str] = Field(default_factory=list)
    ai_suggested: List[str] = Field(default_factory=list)

class CriticalAnalysisSchema(BaseModel):
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    novelty_and_contribution: str = "Not reported in the paper"
    reproducibility_concerns: str = "Not reported in the paper"
    dataset_limitations: str = "Not reported in the paper"
    evaluation_concerns: str = "Not reported in the paper"
    practical_relevance: str = "Not reported in the paper"

class PaperAnalysisResponse(BaseModel):
    id: str
    paper_id: str
    concise_summary: Optional[str] = None
    detailed_summary: Optional[str] = None
    beginner_explanation: Optional[str] = None
    main_contribution: Optional[str] = None
    why_it_matters: Optional[str] = None
    research_objectives: Dict[str, Any] = Field(default_factory=dict)
    methodology: Dict[str, Any] = Field(default_factory=dict)
    results_findings: Dict[str, Any] = Field(default_factory=dict)
    limitations: Dict[str, Any] = Field(default_factory=dict)
    future_scope: Dict[str, Any] = Field(default_factory=dict)
    critical_analysis: Dict[str, Any] = Field(default_factory=dict)
    is_demo_mode: bool = False
    created_at: datetime

    model_config = {"from_attributes": True}

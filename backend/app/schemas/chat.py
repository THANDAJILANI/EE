from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class CitationItem(BaseModel):
    page: Optional[int] = None
    section: Optional[str] = None
    excerpt: str

class ChatRequest(BaseModel):
    question: str

class ChatMessageResponse(BaseModel):
    id: str
    paper_id: str
    role: str
    content: str
    citations: List[CitationItem] = []
    created_at: datetime

    model_config = {"from_attributes": True}

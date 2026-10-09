from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class NoteCreate(BaseModel):
    title: str
    content: str
    tags: List[str] = []
    paper_id: Optional[str] = None

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    tags: Optional[List[str]] = None

class NoteResponse(BaseModel):
    id: str
    paper_id: Optional[str] = None
    title: str
    content: str
    tags: List[str] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

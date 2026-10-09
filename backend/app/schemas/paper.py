from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class PaperMetadataResponse(BaseModel):
    id: str
    paper_id: str
    authors: List[str] = []
    publication_year: Optional[int] = None
    journal_or_conference: Optional[str] = None
    doi: Optional[str] = None
    research_domain: Optional[str] = None
    keywords: List[str] = []
    abstract: Optional[str] = None

    model_config = {"from_attributes": True}

class PaperListItem(BaseModel):
    id: str
    title: str
    filename: str
    file_size: int
    page_count: int
    is_scanned: bool
    processing_status: str
    error_message: Optional[str] = None
    is_favorite: bool
    is_archived: bool
    personal_label: Optional[str] = None
    created_at: datetime
    authors: List[str] = []
    publication_year: Optional[int] = None
    research_domain: Optional[str] = None
    tags: List[str] = []

    model_config = {"from_attributes": True}

class PaperDetailResponse(BaseModel):
    id: str
    user_id: str
    title: str
    filename: str
    file_size: int
    page_count: int
    is_scanned: bool
    processing_status: str
    error_message: Optional[str] = None
    is_favorite: bool
    is_archived: bool
    personal_label: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    metadata: Optional[PaperMetadataResponse] = None
    tags: List[str] = []

    model_config = {"from_attributes": True}

class PaperUpdateRequest(BaseModel):
    title: Optional[str] = None
    personal_label: Optional[str] = None
    is_favorite: Optional[bool] = None
    is_archived: Optional[bool] = None

class PaperTagCreate(BaseModel):
    tag_name: str

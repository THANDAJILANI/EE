from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.paper import ResearchPaper, PaperTag
from app.models.note import UserNote
from app.schemas.note import NoteCreate, NoteUpdate, NoteResponse
from app.schemas.paper import PaperTagCreate
from app.services.auth_service import get_current_user

router = APIRouter(tags=["Notes & Tags"])

# Global Notes Endpoints
@router.get("/notes", response_model=List[NoteResponse])
def get_all_notes(
    paper_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(UserNote).filter(UserNote.user_id == current_user.id)
    if paper_id:
        query = query.filter(UserNote.paper_id == paper_id)
    return query.order_by(UserNote.updated_at.desc()).all()

@router.post("/notes", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
def create_note(
    req: NoteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    note = UserNote(
        user_id=current_user.id,
        paper_id=req.paper_id,
        title=req.title,
        content=req.content,
        tags=req.tags or []
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note

@router.put("/notes/{note_id}", response_model=NoteResponse)
def update_note(
    note_id: str,
    req: NoteUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    note = db.query(UserNote).filter(
        UserNote.id == note_id,
        UserNote.user_id == current_user.id
    ).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    if req.title is not None:
        note.title = req.title
    if req.content is not None:
        note.content = req.content
    if req.tags is not None:
        note.tags = req.tags

    db.commit()
    db.refresh(note)
    return note

@router.delete("/notes/{note_id}")
def delete_note(
    note_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    note = db.query(UserNote).filter(
        UserNote.id == note_id,
        UserNote.user_id == current_user.id
    ).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    db.delete(note)
    db.commit()
    return {"message": "Note deleted successfully"}

# Paper-Specific Notes & Tags Endpoints
@router.post("/papers/{paper_id}/notes", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
def create_paper_note(
    paper_id: str,
    req: NoteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    paper = db.query(ResearchPaper).filter(
        ResearchPaper.id == paper_id,
        ResearchPaper.user_id == current_user.id
    ).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")

    note = UserNote(
        user_id=current_user.id,
        paper_id=paper_id,
        title=req.title,
        content=req.content,
        tags=req.tags or []
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note

@router.get("/papers/{paper_id}/notes", response_model=List[NoteResponse])
def get_paper_notes(
    paper_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(UserNote).filter(
        UserNote.paper_id == paper_id,
        UserNote.user_id == current_user.id
    ).order_by(UserNote.created_at.desc()).all()

@router.post("/papers/{paper_id}/tags")
def add_paper_tag(
    paper_id: str,
    req: PaperTagCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    paper = db.query(ResearchPaper).filter(
        ResearchPaper.id == paper_id,
        ResearchPaper.user_id == current_user.id
    ).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")

    clean_tag = req.tag_name.strip()
    if not clean_tag:
        raise HTTPException(status_code=400, detail="Tag cannot be empty")

    existing = db.query(PaperTag).filter(
        PaperTag.paper_id == paper_id,
        PaperTag.user_id == current_user.id,
        PaperTag.tag_name == clean_tag
    ).first()
    if existing:
        return {"message": "Tag already exists", "tag": clean_tag}

    tag = PaperTag(
        paper_id=paper_id,
        user_id=current_user.id,
        tag_name=clean_tag
    )
    db.add(tag)
    db.commit()
    return {"message": "Tag added successfully", "tag": clean_tag}

@router.delete("/papers/{paper_id}/tags/{tag_name}")
def remove_paper_tag(
    paper_id: str,
    tag_name: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tag = db.query(PaperTag).filter(
        PaperTag.paper_id == paper_id,
        PaperTag.user_id == current_user.id,
        PaperTag.tag_name == tag_name
    ).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    db.delete(tag)
    db.commit()
    return {"message": "Tag removed successfully"}

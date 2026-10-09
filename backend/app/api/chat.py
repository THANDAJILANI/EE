from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.paper import ResearchPaper
from app.models.chat import ChatMessage
from app.schemas.chat import ChatRequest, ChatMessageResponse
from app.services.auth_service import get_current_user
from app.services.chat_service import answer_paper_question

router = APIRouter(prefix="/papers", tags=["Chat With Paper"])

@router.post("/{paper_id}/chat", response_model=ChatMessageResponse)
async def chat_with_paper(
    paper_id: str,
    req: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Enforce per-user document isolation
    paper = db.query(ResearchPaper).filter(
        ResearchPaper.id == paper_id,
        ResearchPaper.user_id == current_user.id
    ).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Research paper not found in your library")

    # Record user message
    user_msg = ChatMessage(
        paper_id=paper.id,
        user_id=current_user.id,
        role="user",
        content=req.question,
        citations=[]
    )
    db.add(user_msg)
    db.commit()

    # Generate grounded response
    res = await answer_paper_question(paper, req.question)

    # Save assistant message
    bot_msg = ChatMessage(
        paper_id=paper.id,
        user_id=current_user.id,
        role="assistant",
        content=res["content"],
        citations=res["citations"]
    )
    db.add(bot_msg)
    db.commit()
    db.refresh(bot_msg)

    return bot_msg

@router.get("/{paper_id}/chat", response_model=List[ChatMessageResponse])
def get_chat_history(
    paper_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    paper = db.query(ResearchPaper).filter(
        ResearchPaper.id == paper_id,
        ResearchPaper.user_id == current_user.id
    ).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Research paper not found in your library")

    return db.query(ChatMessage).filter(
        ChatMessage.paper_id == paper_id,
        ChatMessage.user_id == current_user.id
    ).order_by(ChatMessage.created_at.asc()).all()

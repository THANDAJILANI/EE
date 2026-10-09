import io
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response, StreamingResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.paper import ResearchPaper
from app.models.literature import LiteratureReview, LiteratureReviewPaper
from app.schemas.literature import (
    LiteratureReviewCreate,
    LiteratureReviewResponse,
    LiteratureReviewListItem
)
from app.services.auth_service import get_current_user
from app.services.literature_service import generate_literature_review
from app.services.export_service import generate_docx_literature_review, generate_csv_matrix

router = APIRouter(prefix="/literature-reviews", tags=["Literature Reviews"])

@router.post("", response_model=LiteratureReviewResponse, status_code=status.HTTP_201_CREATED)
def create_literature_review(
    req: LiteratureReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Fetch user papers
    papers = db.query(ResearchPaper).filter(
        ResearchPaper.id.in_(req.paper_ids),
        ResearchPaper.user_id == current_user.id
    ).all()

    if not papers:
        raise HTTPException(status_code=400, detail="None of the selected papers were found in your library")

    synth_res = generate_literature_review(
        topic=req.topic,
        papers=papers,
        citation_style=req.citation_style or "IEEE"
    )

    review = LiteratureReview(
        user_id=current_user.id,
        title=req.title,
        topic=req.topic,
        citation_style=req.citation_style or "IEEE",
        paper_ids=req.paper_ids,
        individual_paper_notes=synth_res["individual_paper_notes"],
        matrix_data=synth_res["matrix_data"],
        thematic_review=synth_res["thematic_review"],
        chronological_review=synth_res["chronological_review"],
        methodology_comparison=synth_res["methodology_comparison"],
        common_gaps=synth_res["common_gaps"],
        conflicting_findings=synth_res["conflicting_findings"],
        future_directions=synth_res["future_directions"],
        draft_review_markdown=synth_res["draft_review_markdown"]
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    # Add join records
    for note in synth_res["individual_paper_notes"]:
        rp_join = LiteratureReviewPaper(
            literature_review_id=review.id,
            paper_id=note["paper_id"],
            relevance_to_topic=note.get("relevance_to_topic"),
            specific_notes=note.get("key_results")
        )
        db.add(rp_join)
    db.commit()

    return review

@router.get("", response_model=List[LiteratureReviewListItem])
def list_literature_reviews(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    reviews = db.query(LiteratureReview).filter(
        LiteratureReview.user_id == current_user.id
    ).order_by(LiteratureReview.created_at.desc()).all()

    return [
        LiteratureReviewListItem(
            id=r.id,
            title=r.title,
            topic=r.topic,
            paper_count=len(r.paper_ids or []),
            created_at=r.created_at
        )
        for r in reviews
    ]

@router.get("/{review_id}", response_model=LiteratureReviewResponse)
def get_literature_review(
    review_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    review = db.query(LiteratureReview).filter(
        LiteratureReview.id == review_id,
        LiteratureReview.user_id == current_user.id
    ).first()
    if not review:
        raise HTTPException(status_code=404, detail="Literature review not found")
    return review

@router.delete("/{review_id}")
def delete_literature_review(
    review_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    review = db.query(LiteratureReview).filter(
        LiteratureReview.id == review_id,
        LiteratureReview.user_id == current_user.id
    ).first()
    if not review:
        raise HTTPException(status_code=404, detail="Literature review not found")
    db.delete(review)
    db.commit()
    return {"message": "Literature review deleted successfully"}

@router.get("/{review_id}/export/docx")
def export_review_docx(
    review_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    review = db.query(LiteratureReview).filter(
        LiteratureReview.id == review_id,
        LiteratureReview.user_id == current_user.id
    ).first()
    if not review:
        raise HTTPException(status_code=404, detail="Literature review not found")

    docx_stream = generate_docx_literature_review(review)
    filename = f"literature_review_{review.title[:30].replace(' ', '_')}.docx"
    return StreamingResponse(
        docx_stream,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/{review_id}/export/csv")
def export_review_matrix_csv(
    review_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    review = db.query(LiteratureReview).filter(
        LiteratureReview.id == review_id,
        LiteratureReview.user_id == current_user.id
    ).first()
    if not review:
        raise HTTPException(status_code=404, detail="Literature review not found")

    csv_content = generate_csv_matrix(review.matrix_data or [])
    filename = f"literature_matrix_{review.title[:30].replace(' ', '_')}.csv"
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

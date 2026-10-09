from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.paper import ResearchPaper
from app.models.comparison import PaperComparison
from app.schemas.comparison import PaperComparisonCreate, PaperComparisonResponse
from app.services.auth_service import get_current_user
from app.services.comparison_service import generate_paper_comparison
from app.services.export_service import generate_csv_matrix

router = APIRouter(prefix="/comparisons", tags=["Paper Comparisons"])

@router.post("", response_model=PaperComparisonResponse, status_code=status.HTTP_201_CREATED)
def create_comparison(
    req: PaperComparisonCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if len(req.paper_ids) < 2:
        raise HTTPException(status_code=400, detail="Must select at least 2 papers for comparison")
    if len(req.paper_ids) > 10:
        raise HTTPException(status_code=400, detail="Comparison limited to maximum 10 papers")

    papers = db.query(ResearchPaper).filter(
        ResearchPaper.id.in_(req.paper_ids),
        ResearchPaper.user_id == current_user.id
    ).all()

    if len(papers) < 2:
        raise HTTPException(status_code=400, detail="At least 2 valid papers from your library must be selected")

    comp_res = generate_paper_comparison(papers)

    comparison = PaperComparison(
        user_id=current_user.id,
        title=req.title or "Comparative Analysis",
        paper_ids=req.paper_ids,
        comparison_matrix=comp_res["comparison_matrix"],
        similarities=comp_res["similarities"],
        differences=comp_res["differences"],
        best_performing_analysis=comp_res["best_performing_analysis"],
        common_weaknesses=comp_res["common_weaknesses"],
        unexplored_opportunities=comp_res["unexplored_opportunities"]
    )
    db.add(comparison)
    db.commit()
    db.refresh(comparison)
    return comparison

@router.get("", response_model=List[PaperComparisonResponse])
def list_comparisons(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(PaperComparison).filter(
        PaperComparison.user_id == current_user.id
    ).order_by(PaperComparison.created_at.desc()).all()

@router.get("/{comparison_id}", response_model=PaperComparisonResponse)
def get_comparison(
    comparison_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    comp = db.query(PaperComparison).filter(
        PaperComparison.id == comparison_id,
        PaperComparison.user_id == current_user.id
    ).first()
    if not comp:
        raise HTTPException(status_code=404, detail="Comparison record not found")
    return comp

@router.get("/{comparison_id}/export/csv")
def export_comparison_csv(
    comparison_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    comp = db.query(PaperComparison).filter(
        PaperComparison.id == comparison_id,
        PaperComparison.user_id == current_user.id
    ).first()
    if not comp:
        raise HTTPException(status_code=404, detail="Comparison record not found")

    csv_content = generate_csv_matrix(comp.comparison_matrix or [])
    filename = f"comparison_{comp.title[:25].replace(' ', '_')}.csv"
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

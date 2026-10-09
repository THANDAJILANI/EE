import json
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response, StreamingResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.paper import ResearchPaper
from app.services.auth_service import get_current_user
from app.services.export_service import generate_paper_pdf

router = APIRouter(prefix="/papers", tags=["Paper Exports"])

@router.post("/{paper_id}/export")
@router.get("/{paper_id}/export")
def export_paper_analysis(
    paper_id: str,
    format: str = Query("pdf", description="Export format: 'pdf' or 'json'"),
    type: str = Query("executive_summary", description="Report type: 'executive_summary' or 'full_analysis'"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    paper = db.query(ResearchPaper).filter(
        ResearchPaper.id == paper_id,
        ResearchPaper.user_id == current_user.id
    ).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Research paper not found")

    clean_title = paper.title[:30].replace(" ", "_").replace("/", "_").replace("\\", "_")

    if format.lower() == "pdf":
        pdf_stream = generate_paper_pdf(paper, export_type=type)
        filename = f"{clean_title}_{type}.pdf"
        return StreamingResponse(
            pdf_stream,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    elif format.lower() == "json":
        analysis = paper.analysis
        data = {
            "title": paper.title,
            "filename": paper.filename,
            "page_count": paper.page_count,
            "created_at": str(paper.created_at),
            "analysis": {
                "concise_summary": analysis.concise_summary if analysis else None,
                "detailed_summary": analysis.detailed_summary if analysis else None,
                "beginner_explanation": analysis.beginner_explanation if analysis else None,
                "main_contribution": analysis.main_contribution if analysis else None,
                "why_it_matters": analysis.why_it_matters if analysis else None,
                "research_objectives": analysis.research_objectives if analysis else {},
                "methodology": analysis.methodology if analysis else {},
                "results_findings": analysis.results_findings if analysis else {},
                "limitations": analysis.limitations if analysis else {},
                "future_scope": analysis.future_scope if analysis else {},
                "critical_analysis": analysis.critical_analysis if analysis else {},
                "is_demo_mode": analysis.is_demo_mode if analysis else False
            }
        }
        return Response(
            content=json.dumps(data, indent=2),
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename={clean_title}_analysis.json"}
        )
    else:
        raise HTTPException(status_code=400, detail="Unsupported export format. Supported: 'pdf', 'json'")

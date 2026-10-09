import os
import shutil
import uuid
import re
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.core.config import settings
from app.core.database import get_db
from app.models.user import User
from app.models.paper import ResearchPaper, PaperMetadata, PaperAnalysis, PaperTag
from app.schemas.paper import (
    PaperListItem,
    PaperDetailResponse,
    PaperUpdateRequest,
    PaperTagCreate
)
from app.schemas.analysis import PaperAnalysisResponse
from app.services.auth_service import get_current_user
from app.services.pdf_service import extract_pdf_content
from app.services.ai_service import analyze_paper_content

router = APIRouter(prefix="/papers", tags=["Research Papers"])

def sanitize_filename(filename: str) -> str:
    """Prevents path traversal and cleans unsafe filename characters."""
    clean = os.path.basename(filename)
    clean = re.sub(r"[^\w\.-]", "_", clean)
    return clean or "document.pdf"

@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_paper(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate extension
    safe_name = sanitize_filename(file.filename)
    if not safe_name.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Only PDF documents (.pdf) are supported."
        )

    # User-isolated storage directory
    user_upload_dir = os.path.join(settings.UPLOAD_DIR, current_user.id)
    os.makedirs(user_upload_dir, exist_ok=True)

    file_id = str(uuid.uuid4())
    stored_filename = f"{file_id}_{safe_name}"
    file_path = os.path.join(user_upload_dir, stored_filename)

    # Read and validate file size
    contents = await file.read()
    file_size = len(contents)
    max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024

    if file_size > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum allowed size of {settings.MAX_FILE_SIZE_MB}MB."
        )
    if file_size == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded PDF file is empty (0 bytes)."
        )

    # Save to disk
    with open(file_path, "wb") as f:
        f.write(contents)

    # Create paper record
    paper = ResearchPaper(
        id=file_id,
        user_id=current_user.id,
        title=safe_name.replace(".pdf", "").replace("_", " ").title(),
        filename=safe_name,
        file_path=file_path,
        file_size=file_size,
        processing_status="extracting"
    )
    db.add(paper)
    db.commit()
    db.refresh(paper)

    # Perform PDF extraction
    try:
        extraction_res = extract_pdf_content(file_path)
        paper.page_count = extraction_res["page_count"]
        paper.is_scanned = extraction_res["is_scanned"]
        paper.extracted_text = extraction_res["full_text"]
        paper.extracted_sections = extraction_res["sections"]
        if extraction_res.get("title_candidate"):
            paper.title = extraction_res["title_candidate"]

        # Save metadata
        doc_meta = extraction_res.get("doc_metadata", {})
        meta_rec = PaperMetadata(
            paper_id=paper.id,
            authors=[doc_meta.get("author")] if doc_meta.get("author") else ["Authors not specified"],
            publication_year=int(doc_meta.get("creationDate", "2024")[:4]) if doc_meta.get("creationDate", "").isdigit() else 2024,
            journal_or_conference=doc_meta.get("subject", "Academic Publication"),
            doi=None,
            research_domain="Computer Science / AI",
            keywords=["Research Paper", "Empirical Evaluation"],
            abstract=extraction_res.get("sections", {}).get("Abstract", {}).get("text", "")
        )
        db.add(meta_rec)
        paper.processing_status = "analyzing"
        db.commit()

        # Run AI / Demo Analysis pipeline
        analysis_data = await analyze_paper_content(
            paper_title=paper.title,
            full_text=paper.extracted_text,
            sections=paper.extracted_sections,
            pages=extraction_res["pages"],
            page_count=paper.page_count
        )

        analysis_rec = PaperAnalysis(
            paper_id=paper.id,
            concise_summary=analysis_data.get("concise_summary"),
            detailed_summary=analysis_data.get("detailed_summary"),
            beginner_explanation=analysis_data.get("beginner_explanation"),
            main_contribution=analysis_data.get("main_contribution"),
            why_it_matters=analysis_data.get("why_it_matters"),
            research_objectives=analysis_data.get("research_objectives", {}),
            methodology=analysis_data.get("methodology", {}),
            results_findings=analysis_data.get("results_findings", {}),
            limitations=analysis_data.get("limitations", {}),
            future_scope=analysis_data.get("future_scope", {}),
            critical_analysis=analysis_data.get("critical_analysis", {}),
            is_demo_mode=analysis_data.get("is_demo_mode", True)
        )
        db.add(analysis_rec)
        paper.processing_status = "completed"
        db.commit()

    except Exception as err:
        paper.processing_status = "failed"
        paper.error_message = str(err)
        db.commit()

    return {
        "message": "Paper uploaded and processed",
        "paper_id": paper.id,
        "title": paper.title,
        "status": paper.processing_status,
        "is_scanned": paper.is_scanned
    }

@router.get("", response_model=List[PaperListItem])
def list_papers(
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    is_favorite: Optional[bool] = Query(None),
    is_archived: Optional[bool] = Query(False),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(ResearchPaper).filter(
        ResearchPaper.user_id == current_user.id,
        ResearchPaper.is_archived == is_archived
    )

    if status:
        query = query.filter(ResearchPaper.processing_status == status)
    if is_favorite is not None:
        query = query.filter(ResearchPaper.is_favorite == is_favorite)
    if search:
        search_filter = or_(
            ResearchPaper.title.ilike(f"%{search}%"),
            ResearchPaper.personal_label.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)

    papers = query.order_by(ResearchPaper.created_at.desc()).all()

    # Format list response
    results = []
    for p in papers:
        meta = p.metadata_rel
        tags = [t.tag_name for t in p.tags]
        results.append(PaperListItem(
            id=p.id,
            title=p.title,
            filename=p.filename,
            file_size=p.file_size,
            page_count=p.page_count,
            is_scanned=p.is_scanned,
            processing_status=p.processing_status,
            error_message=p.error_message,
            is_favorite=p.is_favorite,
            is_archived=p.is_archived,
            personal_label=p.personal_label,
            created_at=p.created_at,
            authors=meta.authors if meta else [],
            publication_year=meta.publication_year if meta else None,
            research_domain=meta.research_domain if meta else None,
            tags=tags
        ))
    return results

@router.get("/{paper_id}", response_model=PaperDetailResponse)
def get_paper(
    paper_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    paper = db.query(ResearchPaper).filter(
        ResearchPaper.id == paper_id,
        ResearchPaper.user_id == current_user.id
    ).first()
    if not paper:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Research paper not found")

    tags = [t.tag_name for t in paper.tags]
    return PaperDetailResponse(
        id=paper.id,
        user_id=paper.user_id,
        title=paper.title,
        filename=paper.filename,
        file_size=paper.file_size,
        page_count=paper.page_count,
        is_scanned=paper.is_scanned,
        processing_status=paper.processing_status,
        error_message=paper.error_message,
        is_favorite=paper.is_favorite,
        is_archived=paper.is_archived,
        personal_label=paper.personal_label,
        created_at=paper.created_at,
        updated_at=paper.updated_at,
        metadata=paper.metadata_rel,
        tags=tags
    )

@router.patch("/{paper_id}")
def update_paper(
    paper_id: str,
    updates: PaperUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    paper = db.query(ResearchPaper).filter(
        ResearchPaper.id == paper_id,
        ResearchPaper.user_id == current_user.id
    ).first()
    if not paper:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Research paper not found")

    if updates.title is not None:
        paper.title = updates.title
    if updates.personal_label is not None:
        paper.personal_label = updates.personal_label
    if updates.is_favorite is not None:
        paper.is_favorite = updates.is_favorite
    if updates.is_archived is not None:
        paper.is_archived = updates.is_archived

    db.commit()
    db.refresh(paper)
    return {"message": "Paper updated successfully", "paper_id": paper.id}

@router.delete("/{paper_id}", status_code=status.HTTP_200_OK)
def delete_paper(
    paper_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    paper = db.query(ResearchPaper).filter(
        ResearchPaper.id == paper_id,
        ResearchPaper.user_id == current_user.id
    ).first()
    if not paper:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Research paper not found")

    # Safely remove file from disk
    if os.path.exists(paper.file_path):
        try:
            os.remove(paper.file_path)
        except Exception:
            pass

    db.delete(paper)
    db.commit()
    return {"message": "Paper and related records deleted successfully"}

@router.post("/{paper_id}/analyze")
async def analyze_or_retry_paper(
    paper_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    paper = db.query(ResearchPaper).filter(
        ResearchPaper.id == paper_id,
        ResearchPaper.user_id == current_user.id
    ).first()
    if not paper:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Research paper not found")

    paper.processing_status = "analyzing"
    paper.error_message = None
    db.commit()

    try:
        pages = [{"page_number": idx + 1, "text": p} for idx, p in enumerate((paper.extracted_text or "").split("\n\n"))]
        analysis_data = await analyze_paper_content(
            paper_title=paper.title,
            full_text=paper.extracted_text or "",
            sections=paper.extracted_sections or {},
            pages=pages,
            page_count=paper.page_count
        )

        # Update or create analysis record
        if paper.analysis:
            analysis_rec = paper.analysis
            analysis_rec.concise_summary = analysis_data.get("concise_summary")
            analysis_rec.detailed_summary = analysis_data.get("detailed_summary")
            analysis_rec.beginner_explanation = analysis_data.get("beginner_explanation")
            analysis_rec.main_contribution = analysis_data.get("main_contribution")
            analysis_rec.why_it_matters = analysis_data.get("why_it_matters")
            analysis_rec.research_objectives = analysis_data.get("research_objectives", {})
            analysis_rec.methodology = analysis_data.get("methodology", {})
            analysis_rec.results_findings = analysis_data.get("results_findings", {})
            analysis_rec.limitations = analysis_data.get("limitations", {})
            analysis_rec.future_scope = analysis_data.get("future_scope", {})
            analysis_rec.critical_analysis = analysis_data.get("critical_analysis", {})
            analysis_rec.is_demo_mode = analysis_data.get("is_demo_mode", True)
        else:
            analysis_rec = PaperAnalysis(
                paper_id=paper.id,
                concise_summary=analysis_data.get("concise_summary"),
                detailed_summary=analysis_data.get("detailed_summary"),
                beginner_explanation=analysis_data.get("beginner_explanation"),
                main_contribution=analysis_data.get("main_contribution"),
                why_it_matters=analysis_data.get("why_it_matters"),
                research_objectives=analysis_data.get("research_objectives", {}),
                methodology=analysis_data.get("methodology", {}),
                results_findings=analysis_data.get("results_findings", {}),
                limitations=analysis_data.get("limitations", {}),
                future_scope=analysis_data.get("future_scope", {}),
                critical_analysis=analysis_data.get("critical_analysis", {}),
                is_demo_mode=analysis_data.get("is_demo_mode", True)
            )
            db.add(analysis_rec)

        paper.processing_status = "completed"
        db.commit()
        return {"message": "Analysis completed successfully", "is_demo_mode": analysis_rec.is_demo_mode}

    except Exception as e:
        paper.processing_status = "failed"
        paper.error_message = str(e)
        db.commit()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.get("/{paper_id}/analysis", response_model=PaperAnalysisResponse)
def get_paper_analysis(
    paper_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    paper = db.query(ResearchPaper).filter(
        ResearchPaper.id == paper_id,
        ResearchPaper.user_id == current_user.id
    ).first()
    if not paper:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Research paper not found")
    if not paper.analysis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not yet generated for this paper")

    return paper.analysis

import os
import re
import pymupdf
from typing import Dict, List, Any, Optional

SECTION_PATTERNS = [
    (r"(?i)\b(abstract)\b", "Abstract"),
    (r"(?i)\b(1[\.\s]+introduction|introduction)\b", "Introduction"),
    (r"(?i)\b(2[\.\s]+related work|related work|background|literature review)\b", "Related Work"),
    (r"(?i)\b(methodology|methods|proposed methodology|proposed system|architecture|system model|materials and methods)\b", "Methodology"),
    (r"(?i)\b(experiments?|experimental setup|implementation details|dataset and evaluation)\b", "Experimental Setup"),
    (r"(?i)\b(results?|findings|experimental results|evaluation results)\b", "Results"),
    (r"(?i)\b(discussion|error analysis)\b", "Discussion"),
    (r"(?i)\b(limitations?|threats to validity)\b", "Limitations"),
    (r"(?i)\b(conclusion|conclusions and future work|summary)\b", "Conclusion"),
    (r"(?i)\b(references|bibliography)\b", "References"),
]

def extract_pdf_content(file_path: str) -> Dict[str, Any]:
    """
    Extracts text, metadata, page numbers, and detected sections from a PDF file.
    Supports PyMuPDF with pdfplumber fallback.
    Detects scanned PDFs when machine-readable text is missing.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    pages_data = []
    total_text = ""
    is_scanned = False
    metadata = {}
    title_candidate = ""

    try:
        doc = pymupdf.open(file_path)
        page_count = len(doc)
        metadata = doc.metadata or {}

        for page_idx in range(page_count):
            page = doc[page_idx]
            page_text = page.get_text("text") or ""
            total_text += page_text + "\n"
            pages_data.append({
                "page_number": page_idx + 1,
                "text": page_text.strip(),
                "char_count": len(page_text.strip())
            })
        doc.close()

    except Exception as e:
        # Fallback to pdfplumber
        try:
            import pdfplumber
            with pdfplumber.open(file_path) as pdf:
                page_count = len(pdf.pages)
                metadata = pdf.metadata or {}
                for idx, page in enumerate(pdf.pages):
                    page_text = page.extract_text() or ""
                    total_text += page_text + "\n"
                    pages_data.append({
                        "page_number": idx + 1,
                        "text": page_text.strip(),
                        "char_count": len(page_text.strip())
                    })
        except Exception as fallback_err:
            raise ValueError(f"Failed to extract text from PDF: {str(e)} | Fallback error: {str(fallback_err)}")

    # Check for empty or scanned PDF
    total_chars = len(total_text.strip())
    avg_chars_per_page = (total_chars / max(1, page_count)) if page_count > 0 else 0

    if page_count > 0 and avg_chars_per_page < 60:
        is_scanned = True

    # Detect title candidate from first page
    if pages_data and len(pages_data[0]["text"]) > 0:
        first_lines = [l.strip() for l in pages_data[0]["text"].split("\n") if len(l.strip()) > 3]
        if first_lines:
            # Filter out generic header artifacts like "IEEE TRANSACTIONS", "arXiv:..."
            for line in first_lines[:5]:
                if not re.match(r"(?i)^(arxiv|ieee|acm|springer|elsevier|page \d|vol\.|volume|issn|doi:)", line):
                    title_candidate = line
                    break
            if not title_candidate and first_lines:
                title_candidate = first_lines[0]

    if not title_candidate and metadata.get("title"):
        title_candidate = metadata.get("title")

    # Detect sections and page boundaries
    detected_sections = segment_into_sections(pages_data)

    return {
        "page_count": page_count,
        "is_scanned": is_scanned,
        "total_characters": total_chars,
        "title_candidate": title_candidate or "Untitled Research Paper",
        "doc_metadata": metadata,
        "pages": pages_data,
        "full_text": total_text,
        "sections": detected_sections
    }

def segment_into_sections(pages_data: List[Dict[str, Any]]) -> Dict[str, Dict[str, Any]]:
    """
    Segments the document text into recognized academic sections
    with starting page numbers and text content.
    """
    sections: Dict[str, Dict[str, Any]] = {
        "Header": {"title": "Header & Frontmatter", "start_page": 1, "text": ""},
        "Abstract": {"title": "Abstract", "start_page": 1, "text": ""},
        "Introduction": {"title": "Introduction", "start_page": 1, "text": ""},
        "Related Work": {"title": "Related Work", "start_page": 1, "text": ""},
        "Methodology": {"title": "Methodology", "start_page": 1, "text": ""},
        "Results": {"title": "Results", "start_page": 1, "text": ""},
        "Discussion": {"title": "Discussion", "start_page": 1, "text": ""},
        "Limitations": {"title": "Limitations", "start_page": 1, "text": ""},
        "Conclusion": {"title": "Conclusion", "start_page": 1, "text": ""},
        "References": {"title": "References", "start_page": 1, "text": ""},
    }

    current_section = "Header"
    for page in pages_data:
        p_num = page["page_number"]
        lines = page["text"].split("\n")
        for line in lines:
            line_str = line.strip()
            if not line_str:
                continue

            # Check if this line triggers a new academic section
            matched_section = None
            if len(line_str) < 80: # Section headers are usually short lines
                for pattern, sec_name in SECTION_PATTERNS:
                    if re.match(pattern, line_str):
                        matched_section = sec_name
                        break

            if matched_section:
                current_section = matched_section
                if not sections[current_section]["text"]:
                    sections[current_section]["start_page"] = p_num

            sections[current_section]["text"] += line_str + " "

    # Clean up empty sections
    result = {}
    for k, v in sections.items():
        v["text"] = v["text"].strip()
        if v["text"]:
            result[k] = v

    return result

def create_chunks(pages_data: List[Dict[str, Any]], max_chunk_chars: int = 3500, overlap_chars: int = 300) -> List[Dict[str, Any]]:
    """
    Hierarchical chunker for long papers to feed into LLM without losing context or page grounding.
    """
    chunks = []
    current_chunk = ""
    current_pages = []

    for page in pages_data:
        p_num = page["page_number"]
        p_text = page["text"]
        words = p_text.split(" ")

        for word in words:
            if len(current_chunk) + len(word) + 1 > max_chunk_chars:
                if current_chunk:
                    chunks.append({
                        "chunk_index": len(chunks) + 1,
                        "pages": list(set(current_pages)),
                        "text": current_chunk.strip()
                    })
                    # Keep overlap
                    overlap_text = current_chunk[-overlap_chars:] if len(current_chunk) > overlap_chars else ""
                    current_chunk = overlap_text + " " + word
                    current_pages = [p_num]
            else:
                current_chunk += " " + word
                if p_num not in current_pages:
                    current_pages.append(p_num)

    if current_chunk.strip():
        chunks.append({
            "chunk_index": len(chunks) + 1,
            "pages": list(set(current_pages)),
            "text": current_chunk.strip()
        })

    return chunks

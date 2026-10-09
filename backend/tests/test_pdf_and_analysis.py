import os
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.pdf_service import extract_pdf_content

client = TestClient(app)

def test_pdf_extraction_and_analysis():
    pdf_path = "sample_papers/sample_transformer_study.pdf"
    assert os.path.exists(pdf_path)

    # 1. Direct PDF extraction test
    res = extract_pdf_content(pdf_path)
    assert res["page_count"] >= 1
    assert res["is_scanned"] is False
    assert "FLORES-200" in res["full_text"] or "Low-Resource" in res["full_text"]
    assert "Methodology" in res["sections"] or "Introduction" in res["sections"]

    # 2. Upload via API test
    login_res = client.post("/api/auth/login", json={
        "email": "demo@researchmate.ai",
        "password": "DemoPassword123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    with open(pdf_path, "rb") as f:
        upload_res = client.post(
            "/api/papers/upload",
            files={"file": ("sample_transformer_study.pdf", f, "application/pdf")},
            headers=headers
        )

    assert upload_res.status_code == 201
    paper_id = upload_res.json()["paper_id"]

    # 3. Retrieve analysis test
    analysis_res = client.get(f"/api/papers/{paper_id}/analysis", headers=headers)
    assert analysis_res.status_code == 200
    adata = analysis_res.json()
    assert "concise_summary" in adata
    assert "detailed_summary" in adata
    assert "beginner_explanation" in adata
    assert "research_objectives" in adata
    assert "methodology" in adata
    assert "limitations" in adata
    # Verify strict separation of limitations
    assert "author_stated" in adata["limitations"]
    assert "ai_inferred" in adata["limitations"]
    assert "critical_analysis" in adata
    assert adata["is_demo_mode"] is True

    # 4. Test Chat with Paper
    chat_res = client.post(
        f"/api/papers/{paper_id}/chat",
        json={"question": "What dataset was used in this study?"},
        headers=headers
    )
    assert chat_res.status_code == 200
    cdata = chat_res.json()
    assert len(cdata["content"]) > 10
    assert len(cdata["citations"]) > 0

    # 5. Test Exports
    pdf_exp = client.get(f"/api/papers/{paper_id}/export?format=pdf&type=executive_summary", headers=headers)
    assert pdf_exp.status_code == 200
    assert pdf_exp.headers["content-type"] == "application/pdf"

    json_exp = client.get(f"/api/papers/{paper_id}/export?format=json", headers=headers)
    assert json_exp.status_code == 200
    assert json_exp.json()["title"] is not None

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_literature_review_and_comparison():
    login_res = client.post("/api/auth/login", json={
        "email": "demo@researchmate.ai",
        "password": "DemoPassword123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch seed papers
    papers_res = client.get("/api/papers", headers=headers)
    assert papers_res.status_code == 200
    papers = papers_res.json()
    assert len(papers) >= 2
    paper_ids = [papers[0]["id"], papers[1]["id"]]

    # 1. Test Literature Review Creation
    lit_res = client.post("/api/literature-reviews", json={
        "title": "Synthesis of Deep Learning Milestones",
        "topic": "Neural Architecture Evolution from ResNets to Transformers",
        "paper_ids": paper_ids,
        "citation_style": "IEEE"
    }, headers=headers)
    assert lit_res.status_code == 201
    lit_data = lit_res.json()
    assert len(lit_data["individual_paper_notes"]) == 2
    assert len(lit_data["matrix_data"]) == 2
    assert "draft_review_markdown" in lit_data
    assert len(lit_data["common_gaps"]) > 0
    review_id = lit_data["id"]

    # Test DOCX Export
    docx_res = client.get(f"/api/literature-reviews/{review_id}/export/docx", headers=headers)
    assert docx_res.status_code == 200
    assert "wordprocessingml" in docx_res.headers["content-type"]

    # Test CSV Export
    csv_res = client.get(f"/api/literature-reviews/{review_id}/export/csv", headers=headers)
    assert csv_res.status_code == 200
    assert "text/csv" in csv_res.headers["content-type"]

    # 2. Test Paper Comparison
    comp_res = client.post("/api/comparisons", json={
        "title": "Transformers vs ResNets Architectural Comparison",
        "paper_ids": paper_ids
    }, headers=headers)
    assert comp_res.status_code == 201
    comp_data = comp_res.json()
    assert len(comp_data["comparison_matrix"]) == 2
    assert len(comp_data["similarities"]) > 0
    assert len(comp_data["differences"]) > 0
    assert "best_performing_analysis" in comp_data
    comparison_id = comp_data["id"]

    # Test Comparison CSV Export
    comp_csv = client.get(f"/api/comparisons/{comparison_id}/export/csv", headers=headers)
    assert comp_csv.status_code == 200
    assert "text/csv" in comp_csv.headers["content-type"]

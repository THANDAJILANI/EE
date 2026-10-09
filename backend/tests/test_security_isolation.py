import uuid
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_document_isolation_and_security():
    uid_a = uuid.uuid4().hex[:8]
    uid_b = uuid.uuid4().hex[:8]
    # User A
    user_a_res = client.post("/api/auth/register", json={
        "email": f"userA_{uid_a}@test.com",
        "password": "Password123!",
        "full_name": "User Alpha"
    })
    token_a = user_a_res.json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # User B
    user_b_res = client.post("/api/auth/register", json={
        "email": f"userB_{uid_b}@test.com",
        "password": "Password123!",
        "full_name": "User Beta"
    })
    token_b = user_b_res.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # User A uploads a paper
    with open("sample_papers/sample_transformer_study.pdf", "rb") as f:
        up_res = client.post(
            "/api/papers/upload",
            files={"file": ("user_a_doc.pdf", f, "application/pdf")},
            headers=headers_a
        )
    assert up_res.status_code == 201
    paper_id_a = up_res.json()["paper_id"]

    # User B tries to access User A's paper -> Must be 404 (isolated)
    bad_get = client.get(f"/api/papers/{paper_id_a}", headers=headers_b)
    assert bad_get.status_code == 404

    # User B tries to delete User A's paper -> Must be 404
    bad_del = client.get(f"/api/papers/{paper_id_a}/analysis", headers=headers_b)
    assert bad_del.status_code == 404

    # User B tries to chat with User A's paper -> Must be 404
    bad_chat = client.post(f"/api/papers/{paper_id_a}/chat", json={"question": "Test"}, headers=headers_b)
    assert bad_chat.status_code == 404

    # Test invalid file format rejection (e.g. .txt instead of .pdf)
    bad_up = client.post(
        "/api/papers/upload",
        files={"file": ("malicious.exe", b"not a pdf", "application/octet-stream")},
        headers=headers_a
    )
    assert bad_up.status_code == 400

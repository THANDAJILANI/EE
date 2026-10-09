import uuid
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_register_and_login():
    uid = uuid.uuid4().hex[:8]
    email = f"testuser_{uid}@example.com"
    password = "SecurePassword123!"

    # Register
    reg_res = client.post("/api/auth/register", json={
        "email": email,
        "password": password,
        "full_name": "Test Researcher",
        "institution": "MIT",
        "field_of_study": "AI Safety"
    })
    assert reg_res.status_code == 201
    data = reg_res.json()
    assert "access_token" in data
    assert data["user"]["email"] == email

    # Duplicate registration should fail
    dup_res = client.post("/api/auth/register", json={
        "email": email,
        "password": password,
        "full_name": "Duplicate"
    })
    assert dup_res.status_code == 400

    # Login
    login_res = client.post("/api/auth/login", json={
        "email": email,
        "password": password
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]

    # Get Me
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["institution"] == "MIT"

    # Unauthorized me
    bad_res = client.get("/api/auth/me")
    assert bad_res.status_code == 401

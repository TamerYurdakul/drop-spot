import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app import database
from sqlmodel import SQLModel


# FastAPI test client
client = TestClient(app)

@pytest.fixture(scope="function", autouse=True)
def setup_database():

    SQLModel.metadata.drop_all(database.engine)
    SQLModel.metadata.create_all(database.engine)
    yield
    SQLModel.metadata.drop_all(database.engine)


def test_auth_flow():

    signup_payload = {
        "email": "testuser@example.com",
        "password": "secret123"
    }

    response = client.post("/auth/signup", json=signup_payload)
    assert response.status_code == 200
    user_data = response.json()
    assert user_data["email"] == signup_payload["email"]
    assert "id" in user_data

    login_payload = {
        "username": "testuser@example.com",
        "password": "secret123"
    }

    response = client.post("/auth/login", data=login_payload)
    assert response.status_code == 200
    token_data = response.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"

    headers = {
        "Authorization": f"Bearer {token_data['access_token']}"
    }

    response = client.get("/auth/me", headers=headers)
    assert response.status_code == 200
    me_data = response.json()
    assert me_data["email"] == signup_payload["email"]

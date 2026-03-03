"""
Unit tests for auth endpoints (register + login).

Tests cover:
- POST /auth/register: success, duplicate email, validation errors
- POST /auth/login: success, wrong password, non-existent email, token validity

to run:
docker-compose exec backend pytest tests/unit/auth/test_auth.py -v --tb=long
"""

import uuid
import pytest
from jose import jwt
from src.config.security import JWT_SECRET_KEY, JWT_ALGORITHM
from src.database.models.user import User


REGISTER_URL = "/auth/register"
LOGIN_URL = "/auth/login"

VALID_USER = {
    "email": "test@example.com",
    "name": "Test User",
    "password": "securepassword123",
}


class TestRegister:
    """Tests for POST /auth/register."""

    def test_register_success(self, client):
        """Successful registration returns 201 with id, email, name."""
        response = client.post(REGISTER_URL, json=VALID_USER)
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == VALID_USER["email"]
        assert data["name"] == VALID_USER["name"]
        assert "id" in data

    def test_register_does_not_return_password(self, client):
        """Response should never include password or password_hash."""
        response = client.post(REGISTER_URL, json=VALID_USER)
        data = response.json()
        assert "password" not in data
        assert "password_hash" not in data

    def test_register_duplicate_email(self, client):
        """Registering with an existing email returns 409."""
        client.post(REGISTER_URL, json=VALID_USER)
        response = client.post(REGISTER_URL, json=VALID_USER)
        assert response.status_code == 409
        assert response.json()["detail"]["error"]["code"] == "USER_EXISTS"

    def test_register_missing_email(self, client):
        """Missing email returns 422."""
        response = client.post(REGISTER_URL, json={"name": "Test", "password": "12345678"})
        assert response.status_code == 422

    def test_register_invalid_email(self, client):
        """Invalid email format returns 422."""
        response = client.post(REGISTER_URL, json={"email": "not-an-email", "name": "Test", "password": "12345678"})
        assert response.status_code == 422

    def test_register_password_too_short(self, client):
        """Password shorter than 8 chars returns 422."""
        response = client.post(REGISTER_URL, json={"email": "a@b.com", "name": "Test", "password": "short"})
        assert response.status_code == 422

    def test_register_missing_name(self, client):
        """Missing name returns 422."""
        response = client.post(REGISTER_URL, json={"email": "a@b.com", "password": "12345678"})
        assert response.status_code == 422

    def test_register_empty_name(self, client):
        """Empty name returns 422 (min_length=1)."""
        response = client.post(REGISTER_URL, json={"email": "a@b.com", "name": "", "password": "12345678"})
        assert response.status_code == 422


class TestLogin:
    """Tests for POST /auth/login."""

    def _register_user(self, client):
        """Helper: register a user before testing login."""
        client.post(REGISTER_URL, json=VALID_USER)

    def test_login_success(self, client, db_session):
        """Successful login returns 200 with access_token and token_type."""
        self._register_user(client)
        user = db_session.query(User).filter(User.email == VALID_USER["email"]).first()
        user.organization_id = uuid.uuid4()
        db_session.commit()
        response = client.post(LOGIN_URL, json={"email": VALID_USER["email"], "password": VALID_USER["password"]})
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_login_returns_valid_jwt(self, client, db_session):
        """The returned token should be a valid JWT with the user's id as sub."""
        reg_response = client.post(REGISTER_URL, json={
            "email": "jwt@test.com",
            "name": "JWT User",
            "password": "securepassword123",
        })
        user_id = reg_response.json()["id"]
        user = db_session.query(User).filter(User.email == "jwt@test.com").first()
        user.organization_id = uuid.uuid4()
        db_session.commit()

        login_response = client.post(LOGIN_URL, json={"email": "jwt@test.com", "password": "securepassword123"})
        token = login_response.json()["access_token"]
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        assert payload["sub"] == user_id

    def test_login_team_setup_not_done(self, client):
        """User with valid credentials but no organization returns 403."""
        self._register_user(client)
        response = client.post(LOGIN_URL, json={"email": VALID_USER["email"], "password": VALID_USER["password"]})
        assert response.status_code == 403
        assert response.json()["detail"]["error"]["code"] == "TEAM_SETUP_NOT_DONE"

    def test_login_wrong_password(self, client):
        """Wrong password returns 401."""
        self._register_user(client)
        response = client.post(LOGIN_URL, json={"email": VALID_USER["email"], "password": "wrongpassword"})
        assert response.status_code == 401
        assert response.json()["detail"]["error"]["code"] == "INVALID_CREDENTIALS"

    def test_login_nonexistent_email(self, client):
        """Non-existent email returns 401 (same error as wrong password)."""
        response = client.post(LOGIN_URL, json={"email": "nobody@example.com", "password": "12345678"})
        assert response.status_code == 401
        assert response.json()["detail"]["error"]["code"] == "INVALID_CREDENTIALS"

    def test_login_missing_email(self, client):
        """Missing email returns 422."""
        response = client.post(LOGIN_URL, json={"password": "12345678"})
        assert response.status_code == 422

    def test_login_missing_password(self, client):
        """Missing password returns 422."""
        response = client.post(LOGIN_URL, json={"email": "a@b.com"})
        assert response.status_code == 422

"""
Unit tests for the users module (schemas, service, routes).

Tests cover:
- Schema validation (UpdateUserRequest)
- Service business logic (user_update, upload_avatar)
- Route endpoints via TestClient (GET /users/me, PATCH /users/me, POST /users/me/avatar)

To run:
    docker-compose exec backend pytest tests/unit/users/ -v --tb=long
"""

import pytest

from src.users.schemas import UpdateUserRequest
from src.users import service


# ---------------------------------------------------------------------------
# Schema tests
# ---------------------------------------------------------------------------

class TestUpdateUserRequestSchema:
	"""Validate Pydantic schema rules for UpdateUserRequest."""

	def test_valid_name_is_accepted(self):
		"""Valid name is accepted."""
		req = UpdateUserRequest(name="Alice")
		assert req.name == "Alice"

	def test_empty_name_is_invalid(self):
		"""Empty name should fail validation (min_length=1)."""
		with pytest.raises(Exception):
			UpdateUserRequest(name="")

	def test_empty_request_is_valid(self):
		"""Both fields are optional — empty request is valid (partial update)."""
		req = UpdateUserRequest()
		assert req.name is None
		assert req.email is None


# ---------------------------------------------------------------------------
# Service tests
# ---------------------------------------------------------------------------

class TestUserUpdate:
	"""Tests for service.user_update."""

	def test_updates_name(self, db_setup):
		"""Updates user name and returns updated user."""
		user, session = db_setup
		result = service.user_update(session, user, "New Name", None)
		assert result.name == "New Name"

	def test_persists_name_to_db(self, db_setup):
		"""Updated name is persisted in the database."""
		user, session = db_setup
		service.user_update(session, user, "Persisted Name", None)
		fresh = session.query(type(user)).filter_by(id=user.id).first()
		assert fresh.name == "Persisted Name"

	def test_returns_user_object(self, db_setup):
		"""Returns the same user object with updated data."""
		user, session = db_setup
		result = service.user_update(session, user, "Updated", None)
		assert result.id == user.id
		assert result.email == user.email


class TestUploadAvatar:
	"""Tests for service.upload_avatar."""

	def test_invalid_content_type_raises_400(self, db_setup):
		"""Raises 400 INVALID_FILE_TYPE for unsupported content types."""
		from fastapi import HTTPException
		user, session = db_setup
		with pytest.raises(HTTPException) as exc_info:
			service.upload_avatar(session, user, b"fake content", "application/pdf")
		assert exc_info.value.status_code == 400
		assert exc_info.value.detail["error"]["code"] == "INVALID_FILE_TYPE"

	def test_file_too_large_raises_400(self, db_setup):
		"""Raises 400 FILE_TOO_LARGE when content exceeds 5MB."""
		from fastapi import HTTPException
		user, session = db_setup
		large_content = b"x" * (5 * 1024 * 1024 + 1)
		with pytest.raises(HTTPException) as exc_info:
			service.upload_avatar(session, user, large_content, "image/jpeg")
		assert exc_info.value.status_code == 400
		assert exc_info.value.detail["error"]["code"] == "FILE_TOO_LARGE"

	def test_upload_success_returns_avatar_url(self, db_setup, sample_png, tmp_path, monkeypatch):
		"""Successful upload returns avatar_url."""
		import src.users.service as svc
		monkeypatch.setattr(svc, "AVATARS_DIR", str(tmp_path))
		user, session = db_setup
		result = service.upload_avatar(session, user, sample_png, "image/png")
		assert result.avatar_url is not None
		assert result.avatar_url.startswith("/static/avatars/")

	def test_upload_success_updates_user_avatar_url(self, db_setup, sample_png, tmp_path, monkeypatch):
		"""Successful upload updates user.avatar_url in the database."""
		import src.users.service as svc
		monkeypatch.setattr(svc, "AVATARS_DIR", str(tmp_path))
		user, session = db_setup
		service.upload_avatar(session, user, sample_png, "image/png")
		session.refresh(user)
		assert user.avatar_url is not None

	def test_upload_saves_file_to_disk(self, db_setup, sample_png, tmp_path, monkeypatch):
		"""Successful upload saves a file to the avatars directory."""
		import os
		import src.users.service as svc
		monkeypatch.setattr(svc, "AVATARS_DIR", str(tmp_path))
		user, session = db_setup
		service.upload_avatar(session, user, sample_png, "image/png")
		files = os.listdir(str(tmp_path))
		assert len(files) == 1


# ---------------------------------------------------------------------------
# Route tests
# ---------------------------------------------------------------------------

GET_ME_URL = "/users/me"
UPDATE_ME_URL = "/users/me"
UPLOAD_AVATAR_URL = "/users/me/avatar"


class TestGetMeRoute:
	"""Tests for GET /users/me."""

	def test_returns_200(self, client):
		"""Returns 200 OK."""
		response = client.get(GET_ME_URL)
		assert response.status_code == 200

	def test_returns_user_fields(self, client, db_setup):
		"""Returns id, email, name in the response."""
		user, session = db_setup
		response = client.get(GET_ME_URL)
		data = response.json()
		assert data["id"] == str(user.id)
		assert data["email"] == user.email
		assert data["name"] == user.name

	def test_returns_nullable_fields_as_null(self, client):
		"""Returns avatar_url, organization_id, scrum_role, org_role, org_name as null by default."""
		response = client.get(GET_ME_URL)
		data = response.json()
		assert data["avatar_url"] is None
		assert data["organization_id"] is None
		assert data["scrum_role"] is None
		assert data["org_role"] is None
		assert data["org_name"] is None

	def test_does_not_return_password(self, client):
		"""Response does not include password_hash."""
		response = client.get(GET_ME_URL)
		data = response.json()
		assert "password_hash" not in data
		assert "password" not in data


class TestUpdateMeRoute:
	"""Tests for PATCH /users/me."""

	def test_update_name_returns_200(self, client):
		"""Valid name update returns 200."""
		response = client.patch(UPDATE_ME_URL, json={"name": "New Name"})
		assert response.status_code == 200

	def test_update_name_reflects_in_response(self, client):
		"""Updated name is returned in the response."""
		response = client.patch(UPDATE_ME_URL, json={"name": "Updated Name"})
		assert response.json()["name"] == "Updated Name"

	def test_update_returns_full_user_response(self, client, db_setup):
		"""Response includes all UserResponse fields."""
		user, session = db_setup
		response = client.patch(UPDATE_ME_URL, json={"name": "Full Response"})
		data = response.json()
		assert data["id"] == str(user.id)
		assert data["email"] == user.email
		assert data["name"] == "Full Response"

	def test_update_empty_name_returns_422(self, client):
		"""Empty name returns 422."""
		response = client.patch(UPDATE_ME_URL, json={"name": ""})
		assert response.status_code == 422

	def test_update_empty_body_returns_200(self, client):
		"""Empty body is valid — both fields are optional (partial update)."""
		response = client.patch(UPDATE_ME_URL, json={})
		assert response.status_code == 200


class TestUploadAvatarRoute:
	"""Tests for POST /users/me/avatar."""

	def test_invalid_content_type_returns_400(self, client):
		"""Returns 400 INVALID_FILE_TYPE for non-image files."""
		response = client.post(
			UPLOAD_AVATAR_URL,
			files={"file": ("document.pdf", b"fake pdf content", "application/pdf")},
		)
		assert response.status_code == 400
		assert response.json()["detail"]["error"]["code"] == "INVALID_FILE_TYPE"

	def test_file_too_large_returns_400(self, client):
		"""Returns 400 FILE_TOO_LARGE when file exceeds 5MB."""
		large_content = b"x" * (5 * 1024 * 1024 + 1)
		response = client.post(
			UPLOAD_AVATAR_URL,
			files={"file": ("large.jpg", large_content, "image/jpeg")},
		)
		assert response.status_code == 400
		assert response.json()["detail"]["error"]["code"] == "FILE_TOO_LARGE"

	def test_upload_valid_png_returns_200(self, client, sample_png, tmp_path, monkeypatch):
		"""Valid PNG upload returns 200 with avatar_url."""
		import src.users.service as svc
		monkeypatch.setattr(svc, "AVATARS_DIR", str(tmp_path))
		response = client.post(
			UPLOAD_AVATAR_URL,
			files={"file": ("avatar.png", sample_png, "image/png")},
		)
		assert response.status_code == 200
		assert "avatar_url" in response.json()

	def test_upload_returns_static_url(self, client, sample_png, tmp_path, monkeypatch):
		"""Returned avatar_url points to the static path."""
		import src.users.service as svc
		monkeypatch.setattr(svc, "AVATARS_DIR", str(tmp_path))
		response = client.post(
			UPLOAD_AVATAR_URL,
			files={"file": ("avatar.png", sample_png, "image/png")},
		)
		assert response.json()["avatar_url"].startswith("/static/avatars/")

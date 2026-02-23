"""
Unit tests for the blockers module (schemas, service, routes).

Tests cover:
- Schema validation (request/response)
- Service business logic (create, list, update, resolve)
- Route endpoints via TestClient (HTTP status codes and response shapes)

To run:
    docker-compose exec backend pytest tests/unit/blockers/ -v --tb=long
"""

import pytest
from uuid import uuid4

from src.blockers.schemas import BlockerCreateRequest, BlockerUpdateRequest
from src.blockers import service
from src.database.models import Blocker
from src.database.models.blocker import BlockerStatus


# ---------------------------------------------------------------------------
# Schema tests
# ---------------------------------------------------------------------------

class TestBlockerSchemas:
	"""Validate Pydantic schema rules for blocker requests."""

	def test_create_request_valid(self):
		"""Valid description is accepted."""
		req = BlockerCreateRequest(description="Blocked by infra issue")
		assert req.description == "Blocked by infra issue"

	def test_create_request_optional_fields_default_to_none(self):
		"""ticket_id and assignee_id default to None."""
		req = BlockerCreateRequest(description="Some blocker")
		assert req.ticket_id is None
		assert req.assignee_id is None

	def test_create_request_empty_description_is_invalid(self):
		"""Empty description should fail validation (min_length=1)."""
		with pytest.raises(Exception):
			BlockerCreateRequest(description="")

	def test_create_request_missing_description_is_invalid(self):
		"""Missing description should fail validation."""
		with pytest.raises(Exception):
			BlockerCreateRequest()

	def test_update_request_all_fields_optional(self):
		"""Update request with no fields should be valid."""
		req = BlockerUpdateRequest()
		assert req.description is None
		assert req.ticket_id is None
		assert req.assignee_id is None

	def test_update_request_with_description(self):
		"""Update request with description provided is valid."""
		req = BlockerUpdateRequest(description="Updated description")
		assert req.description == "Updated description"

	def test_update_request_empty_description_is_invalid(self):
		"""Empty string for description should fail (min_length=1)."""
		with pytest.raises(Exception):
			BlockerUpdateRequest(description="")


# ---------------------------------------------------------------------------
# Service tests
# ---------------------------------------------------------------------------

class TestGetBlockerById:
	"""Tests for service.get_blocker_by_id."""

	def test_returns_blocker_when_found(self, db_setup, sample_blocker):
		"""Returns the blocker when ID exists."""
		user, org, session = db_setup
		result = service.get_blocker_by_id(sample_blocker.id, session)
		assert result.id == sample_blocker.id

	def test_raises_404_when_not_found(self, db_setup):
		"""Raises 404 HTTPException when blocker does not exist."""
		from fastapi import HTTPException
		user, org, session = db_setup
		with pytest.raises(HTTPException) as exc_info:
			service.get_blocker_by_id(uuid4(), session)
		assert exc_info.value.status_code == 404
		assert exc_info.value.detail["error"]["code"] == "NOT_FOUND"


class TestCreateBlocker:
	"""Tests for service.create_blocker."""

	def test_create_blocker_success(self, db_setup):
		"""Creates a blocker with status open by default."""
		user, org, session = db_setup
		blocker = service.create_blocker(session, org.id, user, "CI pipeline failing", None, None)

		assert blocker.id is not None
		assert blocker.description == "CI pipeline failing"
		assert blocker.status == BlockerStatus.OPEN
		assert blocker.organization_id == org.id
		assert blocker.created_by == user.id
		assert blocker.resolved_at is None

	def test_create_blocker_with_valid_developer_assignee(self, db_setup, developer_user):
		"""Creates a blocker with a developer as assignee."""
		user, org, session = db_setup
		blocker = service.create_blocker(session, org.id, user, "Need review", None, developer_user.id)

		assert blocker.assignee_id == developer_user.id

	def test_create_blocker_invalid_assignee_role_raises_400(self, db_setup, non_developer_user):
		"""Raises 400 INVALID_ASSIGNEE when assignee is not a developer."""
		from fastapi import HTTPException
		user, org, session = db_setup
		with pytest.raises(HTTPException) as exc_info:
			service.create_blocker(session, org.id, user, "Blocker", None, non_developer_user.id)
		assert exc_info.value.status_code == 400
		assert exc_info.value.detail["error"]["code"] == "INVALID_ASSIGNEE"

	def test_create_blocker_assignee_not_found_raises_404(self, db_setup):
		"""Raises 404 when assignee user does not exist."""
		from fastapi import HTTPException
		user, org, session = db_setup
		with pytest.raises(HTTPException) as exc_info:
			service.create_blocker(session, org.id, user, "Blocker", None, uuid4())
		assert exc_info.value.status_code == 404


class TestListBlockers:
	"""Tests for service.list_blockers."""

	def test_returns_empty_list_when_no_blockers(self, db_setup):
		"""Returns empty list when org has no blockers."""
		user, org, session = db_setup
		result = service.list_blockers(session, org.id, None)
		assert result == []

	def test_returns_blockers_for_org(self, db_setup, sample_blocker):
		"""Returns blockers belonging to the organization."""
		user, org, session = db_setup
		result = service.list_blockers(session, org.id, None)
		assert len(result) == 1
		assert result[0].id == sample_blocker.id

	def test_filter_open_returns_only_open(self, db_setup, sample_blocker, resolved_blocker):
		"""?status=open returns only open blockers."""
		user, org, session = db_setup
		result = service.list_blockers(session, org.id, "open")
		ids = [b.id for b in result]
		assert sample_blocker.id in ids
		assert resolved_blocker.id not in ids

	def test_filter_resolved_returns_only_resolved(self, db_setup, sample_blocker, resolved_blocker):
		"""?status=resolved returns only resolved blockers."""
		user, org, session = db_setup
		result = service.list_blockers(session, org.id, "resolved")
		ids = [b.id for b in result]
		assert resolved_blocker.id in ids
		assert sample_blocker.id not in ids

	def test_no_filter_returns_all(self, db_setup, sample_blocker, resolved_blocker):
		"""No filter returns all blockers regardless of status."""
		user, org, session = db_setup
		result = service.list_blockers(session, org.id, None)
		assert len(result) == 2


class TestUpdateBlocker:
	"""Tests for service.update_blocker."""

	def test_update_description(self, db_setup, sample_blocker):
		"""Updates description when provided."""
		user, org, session = db_setup
		updated = service.update_blocker(session, sample_blocker, {"description": "Updated description"})
		assert updated.description == "Updated description"

	def test_empty_updates_changes_nothing(self, db_setup, sample_blocker):
		"""Empty updates dict leaves blocker unchanged."""
		user, org, session = db_setup
		original_description = sample_blocker.description
		updated = service.update_blocker(session, sample_blocker, {})
		assert updated.description == original_description

	def test_update_with_valid_assignee(self, db_setup, sample_blocker, developer_user):
		"""Sets assignee_id when assignee is a developer."""
		user, org, session = db_setup
		updated = service.update_blocker(session, sample_blocker, {"assignee_id": developer_user.id})
		assert updated.assignee_id == developer_user.id

	def test_update_unsets_assignee_when_null(self, db_setup, sample_blocker, developer_user):
		"""Setting assignee_id to None clears the assignee."""
		user, org, session = db_setup
		# First set the assignee
		service.update_blocker(session, sample_blocker, {"assignee_id": developer_user.id})
		# Then unset it
		updated = service.update_blocker(session, sample_blocker, {"assignee_id": None})
		assert updated.assignee_id is None

	def test_update_invalid_assignee_role_raises_400(self, db_setup, sample_blocker, non_developer_user):
		"""Raises 400 INVALID_ASSIGNEE when new assignee is not a developer."""
		from fastapi import HTTPException
		user, org, session = db_setup
		with pytest.raises(HTTPException) as exc_info:
			service.update_blocker(session, sample_blocker, {"assignee_id": non_developer_user.id})
		assert exc_info.value.status_code == 400
		assert exc_info.value.detail["error"]["code"] == "INVALID_ASSIGNEE"


class TestResolveBlocker:
	"""Tests for service.resolve_blocker."""

	def test_resolve_sets_status_to_resolved(self, db_setup, sample_blocker):
		"""Resolving changes status from open to resolved."""
		user, org, session = db_setup
		service.resolve_blocker(session, sample_blocker)
		session.refresh(sample_blocker)
		assert sample_blocker.status == BlockerStatus.RESOLVED

	def test_resolve_sets_resolved_at(self, db_setup, sample_blocker):
		"""Resolving sets the resolved_at timestamp."""
		user, org, session = db_setup
		service.resolve_blocker(session, sample_blocker)
		session.refresh(sample_blocker)
		assert sample_blocker.resolved_at is not None

	def test_resolve_already_resolved_raises_409(self, db_setup, resolved_blocker):
		"""Raises 409 BLOCKER_ALREADY_RESOLVED when blocker is already resolved."""
		from fastapi import HTTPException
		user, org, session = db_setup
		with pytest.raises(HTTPException) as exc_info:
			service.resolve_blocker(session, resolved_blocker)
		assert exc_info.value.status_code == 409
		assert exc_info.value.detail["error"]["code"] == "BLOCKER_ALREADY_RESOLVED"


# ---------------------------------------------------------------------------
# Route tests
# ---------------------------------------------------------------------------

CREATE_URL = "/api/v1/organizations/{org_id}/blockers"
LIST_URL = "/api/v1/organizations/{org_id}/blockers"
UPDATE_URL = "/api/v1/blockers/{blocker_id}"
RESOLVE_URL = "/api/v1/blockers/{blocker_id}/resolve"


class TestCreateBlockerRoute:
	"""Tests for POST /organizations/{org_id}/blockers."""

	def test_create_returns_201(self, client, db_setup):
		"""Successful creation returns 201 with expected fields."""
		user, org, session = db_setup
		response = client.post(
			CREATE_URL.format(org_id=org.id),
			json={"description": "CI pipeline is broken"},
		)
		assert response.status_code == 201
		data = response.json()
		assert data["description"] == "CI pipeline is broken"
		assert data["status"] == "open"
		assert "id" in data
		assert "created_at" in data
		assert "created_by" in data

	def test_create_response_has_created_by(self, client, db_setup):
		"""Response includes created_by with id and name."""
		user, org, session = db_setup
		response = client.post(
			CREATE_URL.format(org_id=org.id),
			json={"description": "Test blocker"},
		)
		data = response.json()
		assert data["created_by"]["id"] == str(user.id)
		assert data["created_by"]["name"] == user.name

	def test_create_non_member_org_returns_403(self, client):
		"""Returns 403 when user tries to create a blocker in an org they don't belong to."""
		response = client.post(
			CREATE_URL.format(org_id=uuid4()),
			json={"description": "test"},
		)
		assert response.status_code == 403
		assert response.json()["detail"]["error"]["code"] == "FORBIDDEN"

	def test_create_org_not_found_returns_404(self, client, db_setup):
		"""Returns 404 when org_id doesn't match any organization in the DB."""
		user, org, session = db_setup
		# Override user's org to match a non-existent org
		user.organization_id = uuid4()
		session.commit()
		response = client.post(
			CREATE_URL.format(org_id=user.organization_id),
			json={"description": "test"},
		)
		assert response.status_code == 404

	def test_create_invalid_assignee_returns_400(self, client, db_setup, non_developer_user):
		"""Returns 400 when assignee does not have Developer role."""
		user, org, session = db_setup
		response = client.post(
			CREATE_URL.format(org_id=org.id),
			json={"description": "Blocker", "assignee_id": str(non_developer_user.id)},
		)
		assert response.status_code == 400
		assert response.json()["detail"]["error"]["code"] == "INVALID_ASSIGNEE"

	def test_create_empty_description_returns_422(self, client, db_setup):
		"""Returns 422 when description is empty."""
		user, org, session = db_setup
		response = client.post(
			CREATE_URL.format(org_id=org.id),
			json={"description": ""},
		)
		assert response.status_code == 422

	def test_create_missing_description_returns_422(self, client, db_setup):
		"""Returns 422 when description field is missing."""
		user, org, session = db_setup
		response = client.post(
			CREATE_URL.format(org_id=org.id),
			json={},
		)
		assert response.status_code == 422


class TestListBlockersRoute:
	"""Tests for GET /organizations/{org_id}/blockers."""

	def test_list_returns_200(self, client, db_setup):
		"""Returns 200 with a list."""
		user, org, session = db_setup
		response = client.get(LIST_URL.format(org_id=org.id))
		assert response.status_code == 200
		assert isinstance(response.json(), list)

	def test_list_returns_blockers(self, client, db_setup, sample_blocker):
		"""Returns the blockers created for the org."""
		user, org, session = db_setup
		response = client.get(LIST_URL.format(org_id=org.id))
		data = response.json()
		assert len(data) == 1
		assert data[0]["id"] == str(sample_blocker.id)

	def test_list_filter_open(self, client, db_setup, sample_blocker, resolved_blocker):
		"""?status=open returns only open blockers."""
		user, org, session = db_setup
		response = client.get(LIST_URL.format(org_id=org.id) + "?status=open")
		data = response.json()
		assert all(b["status"] == "open" for b in data)
		ids = [b["id"] for b in data]
		assert str(sample_blocker.id) in ids
		assert str(resolved_blocker.id) not in ids

	def test_list_filter_resolved(self, client, db_setup, sample_blocker, resolved_blocker):
		"""?status=resolved returns only resolved blockers."""
		user, org, session = db_setup
		response = client.get(LIST_URL.format(org_id=org.id) + "?status=resolved")
		data = response.json()
		assert all(b["status"] == "resolved" for b in data)
		ids = [b["id"] for b in data]
		assert str(resolved_blocker.id) in ids
		assert str(sample_blocker.id) not in ids

	def test_list_invalid_status_returns_400(self, client, db_setup):
		"""Returns 400 when status query param has an invalid value."""
		user, org, session = db_setup
		response = client.get(LIST_URL.format(org_id=org.id) + "?status=invalid")
		assert response.status_code == 400
		assert response.json()["detail"]["error"]["code"] == "INVALID_INPUT"

	def test_list_non_member_org_returns_403(self, client):
		"""Returns 403 when user tries to list blockers of an org they don't belong to."""
		response = client.get(LIST_URL.format(org_id=uuid4()))
		assert response.status_code == 403
		assert response.json()["detail"]["error"]["code"] == "FORBIDDEN"


class TestUpdateBlockerRoute:
	"""Tests for PATCH /blockers/{blocker_id}."""

	def test_update_returns_200(self, client, db_setup, sample_blocker):
		"""Successful update returns 200 with updated content."""
		response = client.patch(
			UPDATE_URL.format(blocker_id=sample_blocker.id),
			json={"description": "Updated description"},
		)
		assert response.status_code == 200
		assert response.json()["description"] == "Updated description"

	def test_update_empty_body_changes_nothing(self, client, db_setup, sample_blocker):
		"""Sending empty body leaves blocker unchanged."""
		original_description = sample_blocker.description
		response = client.patch(
			UPDATE_URL.format(blocker_id=sample_blocker.id),
			json={},
		)
		assert response.status_code == 200
		assert response.json()["description"] == original_description

	def test_update_not_found_returns_404(self, client):
		"""Returns 404 when blocker does not exist."""
		response = client.patch(
			UPDATE_URL.format(blocker_id=uuid4()),
			json={"description": "test"},
		)
		assert response.status_code == 404

	def test_update_invalid_assignee_returns_400(self, client, db_setup, sample_blocker, non_developer_user):
		"""Returns 400 when assigning a non-developer user."""
		response = client.patch(
			UPDATE_URL.format(blocker_id=sample_blocker.id),
			json={"assignee_id": str(non_developer_user.id)},
		)
		assert response.status_code == 400
		assert response.json()["detail"]["error"]["code"] == "INVALID_ASSIGNEE"

	def test_update_empty_description_returns_422(self, client, db_setup, sample_blocker):
		"""Returns 422 when description is empty string."""
		response = client.patch(
			UPDATE_URL.format(blocker_id=sample_blocker.id),
			json={"description": ""},
		)
		assert response.status_code == 422


class TestResolveBlockerRoute:
	"""Tests for PATCH /blockers/{blocker_id}/resolve."""

	def test_resolve_returns_204(self, client, db_setup, sample_blocker):
		"""Successful resolve returns 204 No Content."""
		response = client.patch(RESOLVE_URL.format(blocker_id=sample_blocker.id))
		assert response.status_code == 204

	def test_resolve_already_resolved_returns_409(self, client, db_setup, resolved_blocker):
		"""Returns 409 when blocker is already resolved."""
		response = client.patch(RESOLVE_URL.format(blocker_id=resolved_blocker.id))
		assert response.status_code == 409
		assert response.json()["detail"]["error"]["code"] == "BLOCKER_ALREADY_RESOLVED"

	def test_resolve_not_found_returns_404(self, client):
		"""Returns 404 when blocker does not exist."""
		response = client.patch(RESOLVE_URL.format(blocker_id=uuid4()))
		assert response.status_code == 404

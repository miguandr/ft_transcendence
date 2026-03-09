"""
Unit tests for the organizations module (schemas, service, routes).

Tests cover:
- Schema validation (request/response)
- Service business logic (create, select_role, get_members, invite, remove, join)
- Route endpoints via TestClient (HTTP status codes and response shapes)

To run:
	docker-compose exec backend pytest tests/unit/organizations/ -v --tb=long
"""

import pytest
from uuid import uuid4

from src.organizations.schemas import (
	OrgCreateRequest,
	OrgSelectRoleRequest,
	OrgInviteMemberRequest,
	OrgJoinRequest,
)
from src.organizations import service
from src.database.models import User, Organization
from src.database.models.enums import OrgRole, ScrumRole


# ---------------------------------------------------------------------------
# Schema tests
# ---------------------------------------------------------------------------

class TestOrgSchemas:
	"""Validate Pydantic schema rules for organization requests."""

	def test_create_request_valid(self):
		req = OrgCreateRequest(name="My Org")
		assert req.name == "My Org"

	def test_create_request_empty_name_is_invalid(self):
		with pytest.raises(Exception):
			OrgCreateRequest(name="")

	def test_create_request_missing_name_is_invalid(self):
		with pytest.raises(Exception):
			OrgCreateRequest()

	def test_select_role_request_valid(self):
		req = OrgSelectRoleRequest(scrum_role=ScrumRole.scrum_master)
		assert req.scrum_role == ScrumRole.scrum_master

	def test_select_role_request_invalid_role(self):
		with pytest.raises(Exception):
			OrgSelectRoleRequest(scrum_role="invalid_role")

	def test_invite_request_valid(self):
		req = OrgInviteMemberRequest(name="John", email="john@example.com")
		assert req.name == "John"
		assert req.email == "john@example.com"

	def test_invite_request_empty_name_is_invalid(self):
		with pytest.raises(Exception):
			OrgInviteMemberRequest(name="", email="john@example.com")

	def test_invite_request_empty_email_is_invalid(self):
		with pytest.raises(Exception):
			OrgInviteMemberRequest(name="John", email="")

	def test_join_request_valid(self):
		req = OrgJoinRequest(join_code="ABC-123")
		assert req.join_code == "ABC-123"

	def test_join_request_empty_code_is_invalid(self):
		with pytest.raises(Exception):
			OrgJoinRequest(join_code="")


# ---------------------------------------------------------------------------
# Service tests — create_organization
# ---------------------------------------------------------------------------

class TestCreateOrganization:
	"""Tests for service.create_organization."""

	def test_create_success(self, db_session, admin_user):
		"""Creates an org and makes the user admin."""
		org = service.create_organization(db_session, admin_user, "New Org")

		assert org.id is not None
		assert org.name == "New Org"
		assert org.join_code is not None
		assert len(org.join_code) == 7  # ABC-123
		assert "-" in org.join_code
		assert org.created_by == admin_user.id
		assert admin_user.organization_id == org.id
		assert admin_user.org_role == OrgRole.admin

	def test_create_join_code_format(self, db_session, admin_user):
		"""Join code follows ABC-123 format."""
		org = service.create_organization(db_session, admin_user, "Code Test Org")
		letters, digits = org.join_code.split("-")
		assert letters.isalpha() and letters.isupper() and len(letters) == 3
		assert digits.isdigit() and len(digits) == 3

	def test_create_duplicate_name_raises_409(self, db_session, admin_user):
		"""Raises 409 ORG_EXISTS for duplicate name (case-insensitive)."""
		from fastapi import HTTPException
		service.create_organization(db_session, admin_user, "Duplicate Org")

		# Create a second user to try creating with the same name
		user2 = User(
			id=uuid4(),
			email="user2@example.com",
			name="User Two",
			password_hash="hashed",
		)
		db_session.add(user2)
		db_session.commit()

		with pytest.raises(HTTPException) as exc_info:
			service.create_organization(db_session, user2, "duplicate org")
		assert exc_info.value.status_code == 409
		assert exc_info.value.detail["error"]["code"] == "ORG_EXISTS"

	def test_create_different_name_succeeds(self, db_session, admin_user):
		"""Different names create separate orgs."""
		service.create_organization(db_session, admin_user, "Org A")

		user2 = User(
			id=uuid4(),
			email="user2b@example.com",
			name="User Two B",
			password_hash="hashed",
		)
		db_session.add(user2)
		db_session.commit()

		org2 = service.create_organization(db_session, user2, "Org B")
		assert org2.name == "Org B"


# ---------------------------------------------------------------------------
# Service tests — select_role
# ---------------------------------------------------------------------------

class TestSelectRole:
	"""Tests for service.select_role."""

	def test_select_role_success(self, org_with_admin):
		"""Creator can select a scrum role."""
		org, admin, session = org_with_admin
		# Admin already has scrum_master, change to product_owner
		result = service.select_role(session, admin, org.id, ScrumRole.product_owner)
		assert result == ScrumRole.product_owner

	def test_select_role_developer(self, org_with_admin):
		"""Creator can select developer role."""
		org, admin, session = org_with_admin
		result = service.select_role(session, admin, org.id, ScrumRole.developer)
		assert result == ScrumRole.developer

	def test_select_role_non_creator_raises_403(self, org_with_admin, member_user):
		"""Non-creator gets 403."""
		from fastapi import HTTPException
		org, admin, session = org_with_admin
		with pytest.raises(HTTPException) as exc_info:
			service.select_role(session, member_user, org.id, ScrumRole.developer)
		assert exc_info.value.status_code == 403

	def test_select_role_org_not_found_raises_404(self, db_session, admin_user):
		"""Raises 404 for non-existent org."""
		from fastapi import HTTPException
		with pytest.raises(HTTPException) as exc_info:
			service.select_role(db_session, admin_user, uuid4(), ScrumRole.developer)
		assert exc_info.value.status_code == 404

	def test_select_role_taken_raises_409(self, org_with_admin, member_user):
		"""Raises 409 when SM/PO role is already taken by another member."""
		from fastapi import HTTPException
		org, admin, session = org_with_admin
		# admin already has scrum_master
		# Second user as creator would fail, but we test the role check directly
		# Make a second org where member_user is creator to test
		org2 = Organization(
			id=uuid4(),
			name="Org For Role Test",
			join_code="ROL-001",
			created_by=member_user.id,
		)
		session.add(org2)
		session.flush()
		member_user.organization_id = org2.id
		member_user.org_role = "admin"
		session.commit()

		# Add a user who already holds scrum_master in org2
		sm_user = User(
			id=uuid4(),
			email="sm@example.com",
			name="SM User",
			password_hash="hashed",
			organization_id=org2.id,
			org_role="member",
			scrum_role="scrum_master",
		)
		session.add(sm_user)
		session.commit()

		with pytest.raises(HTTPException) as exc_info:
			service.select_role(session, member_user, org2.id, ScrumRole.scrum_master)
		assert exc_info.value.status_code == 409
		assert exc_info.value.detail["error"]["code"] == "ROLE_TAKEN"


# ---------------------------------------------------------------------------
# Service tests — get_organization_members
# ---------------------------------------------------------------------------

class TestGetOrganizationMembers:
	"""Tests for service.get_organization_members."""

	def test_returns_members(self, org_with_admin, member_user):
		"""Returns all members of the organization."""
		org, admin, session = org_with_admin
		members = service.get_organization_members(session, org.id)
		ids = [m.id for m in members]
		assert admin.id in ids
		assert member_user.id in ids
		assert len(members) == 2

	def test_returns_only_org_members(self, org_with_admin, second_user):
		"""Does not return users from other orgs."""
		org, admin, session = org_with_admin
		members = service.get_organization_members(session, org.id)
		ids = [m.id for m in members]
		assert second_user.id not in ids

	def test_org_not_found_raises_404(self, db_session):
		"""Raises 404 for non-existent org."""
		from fastapi import HTTPException
		with pytest.raises(HTTPException) as exc_info:
			service.get_organization_members(db_session, uuid4())
		assert exc_info.value.status_code == 404


# ---------------------------------------------------------------------------
# Service tests — invite_member
# ---------------------------------------------------------------------------

class TestInviteMember:
	"""Tests for service.invite_member."""

	def test_invite_returns_email(self, org_with_admin):
		"""Returns the invited email address."""
		org, admin, session = org_with_admin
		result = service.invite_member(session, org.id, "New User", "newuser@example.com")
		assert result == "newuser@example.com"

	def test_invite_already_member_raises_409(self, org_with_admin):
		"""Raises 409 ALREADY_MEMBER when user is already in the org."""
		from fastapi import HTTPException
		org, admin, session = org_with_admin
		with pytest.raises(HTTPException) as exc_info:
			service.invite_member(session, org.id, "Admin", admin.email)
		assert exc_info.value.status_code == 409
		assert exc_info.value.detail["error"]["code"] == "ALREADY_MEMBER"

	def test_invite_org_not_found_raises_404(self, db_session):
		"""Raises 404 for non-existent org."""
		from fastapi import HTTPException
		with pytest.raises(HTTPException) as exc_info:
			service.invite_member(db_session, uuid4(), "Name", "email@example.com")
		assert exc_info.value.status_code == 404


# ---------------------------------------------------------------------------
# Service tests — remove_member
# ---------------------------------------------------------------------------

class TestRemoveMember:
	"""Tests for service.remove_member."""

	def test_remove_success(self, org_with_admin, member_user):
		"""Removes a member from the org."""
		org, admin, session = org_with_admin
		service.remove_member(session, org.id, member_user.id)
		session.refresh(member_user)
		assert member_user.organization_id is None
		assert member_user.org_role is None
		assert member_user.scrum_role is None

	def test_remove_user_not_in_org_raises_404(self, org_with_admin, second_user):
		"""Raises 404 when user is not in the org."""
		from fastapi import HTTPException
		org, admin, session = org_with_admin
		with pytest.raises(HTTPException) as exc_info:
			service.remove_member(session, org.id, second_user.id)
		assert exc_info.value.status_code == 404

	def test_remove_nonexistent_user_raises_404(self, org_with_admin):
		"""Raises 404 for non-existent user."""
		from fastapi import HTTPException
		org, admin, session = org_with_admin
		with pytest.raises(HTTPException) as exc_info:
			service.remove_member(session, org.id, uuid4())
		assert exc_info.value.status_code == 404

	def test_remove_org_not_found_raises_404(self, db_session):
		"""Raises 404 for non-existent org."""
		from fastapi import HTTPException
		with pytest.raises(HTTPException) as exc_info:
			service.remove_member(db_session, uuid4(), uuid4())
		assert exc_info.value.status_code == 404


# ---------------------------------------------------------------------------
# Service tests — join_organization
# ---------------------------------------------------------------------------

class TestJoinOrganization:
	"""Tests for service.join_organization."""

	def test_join_success(self, org_with_admin, second_user):
		"""User joins org as member with developer role."""
		org, admin, session = org_with_admin
		result = service.join_organization(session, second_user, org.join_code)
		assert result["organization_id"] == org.id
		assert result["org_role"] == OrgRole.member
		assert result["scrum_role"] == ScrumRole.developer
		assert second_user.organization_id == org.id

	def test_join_invalid_code_raises_400(self, db_session, admin_user):
		"""Raises 400 INVALID_CODE for wrong join code."""
		from fastapi import HTTPException
		with pytest.raises(HTTPException) as exc_info:
			service.join_organization(db_session, admin_user, "XXX-999")
		assert exc_info.value.status_code == 400
		assert exc_info.value.detail["error"]["code"] == "INVALID_CODE"

	def test_join_already_member_raises_409(self, org_with_admin):
		"""Raises 409 when user is already in the org."""
		from fastapi import HTTPException
		org, admin, session = org_with_admin
		with pytest.raises(HTTPException) as exc_info:
			service.join_organization(session, admin, org.join_code)
		assert exc_info.value.status_code == 409
		assert exc_info.value.detail["error"]["code"] == "ALREADY_MEMBER"


# ---------------------------------------------------------------------------
# Route tests — POST /organizations
# ---------------------------------------------------------------------------

CREATE_URL = "/organizations"
JOIN_URL = "/organizations/join"
SELECT_ROLE_URL = "/organizations/{org_id}"
MEMBERS_URL = "/organizations/{org_id}/members"
REMOVE_URL = "/organizations/{org_id}/members/{user_id}"


class TestCreateOrganizationRoute:
	"""Tests for POST /organizations."""

	def test_create_returns_201(self, unauthed_user_client):
		"""Successful creation returns 201 with expected fields."""
		response = unauthed_user_client.post(
			CREATE_URL,
			json={"name": "Route Test Org"},
		)
		assert response.status_code == 201
		data = response.json()
		assert data["name"] == "Route Test Org"
		assert "id" in data
		assert "join_code" in data
		assert "created_by" in data

	def test_create_empty_name_returns_422(self, unauthed_user_client):
		"""Returns 422 when name is empty."""
		response = unauthed_user_client.post(CREATE_URL, json={"name": ""})
		assert response.status_code == 422

	def test_create_missing_name_returns_422(self, unauthed_user_client):
		"""Returns 422 when name field is missing."""
		response = unauthed_user_client.post(CREATE_URL, json={})
		assert response.status_code == 422

	def test_create_duplicate_name_returns_409(self, unauthed_user_client):
		"""Returns 409 when org name already exists."""
		unauthed_user_client.post(CREATE_URL, json={"name": "Dup Org"})
		# Need a fresh user for second attempt — same user is already in an org
		# This will still trigger the 409 because name check happens before assignment
		response = unauthed_user_client.post(CREATE_URL, json={"name": "dup org"})
		assert response.status_code == 409
		assert response.json()["detail"]["error"]["code"] == "ORG_EXISTS"


# ---------------------------------------------------------------------------
# Route tests — POST /organizations/join
# ---------------------------------------------------------------------------

class TestJoinOrganizationRoute:
	"""Tests for POST /organizations/join."""

	def test_join_returns_200(self, unauthed_user_client, org_with_admin):
		"""Successful join returns 200 with expected fields."""
		org, admin, session = org_with_admin
		response = unauthed_user_client.post(
			JOIN_URL,
			json={"join_code": org.join_code},
		)
		assert response.status_code == 200
		data = response.json()
		assert data["org_role"] == "member"
		assert data["scrum_role"] == "developer"
		assert "organization_id" in data

	def test_join_invalid_code_returns_400(self, unauthed_user_client):
		"""Returns 400 for invalid join code."""
		response = unauthed_user_client.post(
			JOIN_URL,
			json={"join_code": "INVALID"},
		)
		assert response.status_code == 400
		assert response.json()["detail"]["error"]["code"] == "INVALID_CODE"

	def test_join_already_member_returns_409(self, admin_client, org_with_admin):
		"""Returns 409 when user already belongs to the org."""
		org, admin, session = org_with_admin
		response = admin_client.post(
			JOIN_URL,
			json={"join_code": org.join_code},
		)
		assert response.status_code == 409
		assert response.json()["detail"]["error"]["code"] == "ALREADY_MEMBER"

	def test_join_missing_code_returns_422(self, unauthed_user_client):
		"""Returns 422 when join_code is missing."""
		response = unauthed_user_client.post(
			JOIN_URL,
			json={},
		)
		assert response.status_code == 422


# ---------------------------------------------------------------------------
# Route tests — PATCH /organizations/{org_id} (select role)
# ---------------------------------------------------------------------------

class TestSelectRoleRoute:
	"""Tests for PATCH /organizations/{org_id}."""

	def test_select_role_returns_201(self, admin_client, org_with_admin):
		"""Successful role selection returns 201 with organization_id and scrum_role."""
		org, admin, session = org_with_admin
		response = admin_client.patch(
			SELECT_ROLE_URL.format(org_id=org.id),
			json={"scrum_role": "product_owner"},
		)
		assert response.status_code == 201
		data = response.json()
		assert data["scrum_role"] == "product_owner"
		assert data["organization_id"] == str(org.id)

	def test_select_role_invalid_role_returns_422(self, admin_client, org_with_admin):
		"""Returns 422 for invalid scrum role."""
		org, admin, session = org_with_admin
		response = admin_client.patch(
			SELECT_ROLE_URL.format(org_id=org.id),
			json={"scrum_role": "invalid_role"},
		)
		assert response.status_code == 422

	def test_select_role_org_not_found_returns_404(self, admin_client):
		"""Returns 404 for non-existent org."""
		response = admin_client.patch(
			SELECT_ROLE_URL.format(org_id=uuid4()),
			json={"scrum_role": "developer"},
		)
		assert response.status_code == 404


# ---------------------------------------------------------------------------
# Route tests — GET /organizations/{org_id}/members
# ---------------------------------------------------------------------------

class TestGetMembersRoute:
	"""Tests for GET /organizations/{org_id}/members."""

	def test_get_members_returns_200(self, admin_client, org_with_admin):
		"""Returns 200 with a list of members."""
		org, admin, session = org_with_admin
		response = admin_client.get(MEMBERS_URL.format(org_id=org.id))
		assert response.status_code == 200
		data = response.json()
		assert isinstance(data, list)
		assert len(data) >= 1

	def test_get_members_response_shape(self, admin_client, org_with_admin):
		"""Response contains expected fields for each member."""
		org, admin, session = org_with_admin
		response = admin_client.get(MEMBERS_URL.format(org_id=org.id))
		data = response.json()
		member = data[0]
		assert "id" in member
		assert "name" in member
		assert "org_role" in member
		assert "scrum_role" in member
		assert "tickets" in member
		assert "tasks" in member
		assert "blockers" in member

	def test_get_members_non_member_returns_403(self, unauthed_user_client, org_with_admin):
		"""Returns 403 when user is not a member of the org."""
		org, admin, session = org_with_admin
		response = unauthed_user_client.get(MEMBERS_URL.format(org_id=org.id))
		assert response.status_code == 403


# ---------------------------------------------------------------------------
# Route tests — POST /organizations/{org_id}/members (invite)
# ---------------------------------------------------------------------------

class TestInviteMemberRoute:
	"""Tests for POST /organizations/{org_id}/members."""

	def test_invite_returns_201(self, admin_client, org_with_admin):
		"""Successful invite returns 201 with email."""
		org, admin, session = org_with_admin
		response = admin_client.post(
			MEMBERS_URL.format(org_id=org.id),
			json={"name": "Invitee", "email": "invitee@example.com"},
		)
		assert response.status_code == 201
		assert response.json()["email"] == "invitee@example.com"

	def test_invite_empty_email_returns_422(self, admin_client, org_with_admin):
		"""Returns 422 when email is empty."""
		org, admin, session = org_with_admin
		response = admin_client.post(
			MEMBERS_URL.format(org_id=org.id),
			json={"name": "Invitee", "email": ""},
		)
		assert response.status_code == 422

	def test_invite_non_member_returns_403(self, unauthed_user_client, org_with_admin):
		"""Returns 403 when user is not a member of the org."""
		org, admin, session = org_with_admin
		response = unauthed_user_client.post(
			MEMBERS_URL.format(org_id=org.id),
			json={"name": "Invitee", "email": "invitee@example.com"},
		)
		assert response.status_code == 403

	def test_invite_already_member_returns_409(self, admin_client, org_with_admin):
		"""Returns 409 when inviting someone already in the org."""
		org, admin, session = org_with_admin
		response = admin_client.post(
			MEMBERS_URL.format(org_id=org.id),
			json={"name": "Admin", "email": admin.email},
		)
		assert response.status_code == 409
		assert response.json()["detail"]["error"]["code"] == "ALREADY_MEMBER"


# ---------------------------------------------------------------------------
# Route tests — DELETE /organizations/{org_id}/members/{user_id}
# ---------------------------------------------------------------------------

class TestRemoveMemberRoute:
	"""Tests for DELETE /organizations/{org_id}/members/{user_id}."""

	def test_remove_returns_204(self, admin_client, org_with_admin, member_user):
		"""Successful removal returns 204 No Content."""
		org, admin, session = org_with_admin
		response = admin_client.delete(
			REMOVE_URL.format(org_id=org.id, user_id=member_user.id),
		)
		assert response.status_code == 204

	def test_remove_user_not_found_returns_404(self, admin_client, org_with_admin):
		"""Returns 404 when user is not in the org."""
		org, admin, session = org_with_admin
		response = admin_client.delete(
			REMOVE_URL.format(org_id=org.id, user_id=uuid4()),
		)
		assert response.status_code == 404

	def test_remove_non_member_returns_403(self, unauthed_user_client, org_with_admin, member_user):
		"""Returns 403 when requester is not a member of the org."""
		org, admin, session = org_with_admin
		response = unauthed_user_client.delete(
			REMOVE_URL.format(org_id=org.id, user_id=member_user.id),
		)
		assert response.status_code == 403

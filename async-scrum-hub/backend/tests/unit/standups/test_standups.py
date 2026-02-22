"""
Unit tests for the standups module (schemas, service, routes).

Tests cover:
- Schema validation (request/response)
- Service business logic (create, list, update, delete)
- Route endpoints via TestClient (HTTP status codes and response shapes)

NOTE: Tests marked with @pytest.mark.skip require PostgreSQL ARRAY support
and are covered by integration tests instead.

To run:
    docker-compose exec backend pytest tests/unit/standups/ -v --tb=long
"""

import pytest
from datetime import date, timedelta
from uuid import uuid4

from src.standups.schemas import StandupCreateRequest, StandupUpdateRequest
from src.standups import service
from src.database.models import Standup
from src.database.models.blocker import BlockerStatus, Blocker


# ---------------------------------------------------------------------------
# Schema tests
# ---------------------------------------------------------------------------

class TestStandupSchemas:
    """Validate Pydantic schema rules for standup requests."""

    def test_create_request_valid(self):
        """Valid today field is accepted."""
        req = StandupCreateRequest(today="Worked on the API")
        assert req.today == "Worked on the API"

    def test_create_request_empty_today_is_invalid(self):
        """Empty string for today should fail validation (min_length=1)."""
        with pytest.raises(Exception):
            StandupCreateRequest(today="")

    def test_create_request_missing_today_is_invalid(self):
        """Missing today field should fail validation."""
        with pytest.raises(Exception):
            StandupCreateRequest()

    def test_update_request_today_is_optional(self):
        """Update request with no fields should be valid."""
        req = StandupUpdateRequest()
        assert req.today is None

    def test_update_request_with_today(self):
        """Update request with today provided is valid."""
        req = StandupUpdateRequest(today="Updated today content")
        assert req.today == "Updated today content"

    def test_update_request_empty_today_is_invalid(self):
        """Empty string for today should fail (min_length=1)."""
        with pytest.raises(Exception):
            StandupUpdateRequest(today="")


# ---------------------------------------------------------------------------
# Service tests
# ---------------------------------------------------------------------------

class TestGetStandupById:
    """Tests for service.get_standup_by_id."""

    def test_returns_standup_when_found(self, db_setup, sample_standup):
        """Returns the standup when ID exists."""
        user, org, session = db_setup
        result = service.get_standup_by_id(sample_standup.id, session)
        assert result.id == sample_standup.id

    def test_raises_404_when_not_found(self, db_setup):
        """Raises 404 HTTPException when standup does not exist."""
        from fastapi import HTTPException
        user, org, session = db_setup
        with pytest.raises(HTTPException) as exc_info:
            service.get_standup_by_id(uuid4(), session)
        assert exc_info.value.status_code == 404
        assert exc_info.value.detail["error"]["code"] == "NOT_FOUND"


class TestCreateStandup:
    """Tests for service.create_standup."""

    def test_create_standup_success(self, db_setup):
        """Creates a standup and returns it."""
        user, org, session = db_setup
        standup = service.create_standup(session, org.id, user, "Today I worked on tests")

        assert standup.id is not None
        assert standup.today == "Today I worked on tests"
        assert standup.organization_id == org.id
        assert standup.created_by == user.id
        assert standup.standup_date == date.today()

    def test_create_standup_yesterday_is_null_when_no_previous(self, db_setup):
        """yesterday is None when user has no previous standup."""
        user, org, session = db_setup
        standup = service.create_standup(session, org.id, user, "First standup ever")
        assert standup.yesterday is None

    def test_create_standup_auto_populates_yesterday(self, db_setup):
        """yesterday is auto-filled from previous day's today field."""
        user, org, session = db_setup

        # Create a standup for yesterday
        yesterday_standup = Standup(
            id=uuid4(),
            organization_id=org.id,
            created_by=user.id,
            today="Yesterday's work content",
            standup_date=date.today() - timedelta(days=1),
            blocker_ids=None,
        )
        session.add(yesterday_standup)
        session.commit()

        standup = service.create_standup(session, org.id, user, "Today's work")
        assert standup.yesterday == "Yesterday's work content"

    @pytest.mark.skip(reason="blocker_ids ARRAY not supported in SQLite - covered by integration tests")
    def test_create_standup_auto_populates_blocker_ids(self, db_setup, sample_blocker):
        """blocker_ids is auto-filled with open blockers in the org."""
        user, org, session = db_setup
        standup = service.create_standup(session, org.id, user, "Working despite blockers")
        assert sample_blocker.id in standup.blocker_ids

    @pytest.mark.skip(reason="blocker_ids ARRAY not supported in SQLite - covered by integration tests")
    def test_create_standup_does_not_include_resolved_blockers(self, db_setup):
        """Resolved blockers are not included in blocker_ids."""
        user, org, session = db_setup

        resolved_blocker = Blocker(
            id=uuid4(),
            organization_id=org.id,
            created_by=user.id,
            description="Already resolved",
            status=BlockerStatus.RESOLVED,
        )
        session.add(resolved_blocker)
        session.commit()

        standup = service.create_standup(session, org.id, user, "No blockers today")
        assert resolved_blocker.id not in (standup.blocker_ids or [])

    def test_create_standup_duplicate_today_raises_409(self, db_setup, sample_standup):
        """Creating a second standup today raises 409 STANDUP_ALREADY_EXISTS."""
        from fastapi import HTTPException
        user, org, session = db_setup

        with pytest.raises(HTTPException) as exc_info:
            service.create_standup(session, org.id, user, "Duplicate standup")
        assert exc_info.value.status_code == 409
        assert exc_info.value.detail["error"]["code"] == "STANDUP_ALREADY_EXISTS"


class TestListStandups:
    """Tests for service.list_standups."""

    def test_returns_empty_list_when_no_standups(self, db_setup):
        """Returns empty list when org has no standups."""
        user, org, session = db_setup
        result = service.list_standups(session, org.id)
        assert result == []

    def test_returns_standups_for_org(self, db_setup, sample_standup):
        """Returns standups belonging to the organization."""
        user, org, session = db_setup
        result = service.list_standups(session, org.id)
        assert len(result) == 1
        assert result[0].id == sample_standup.id

    def test_ordered_by_date_descending(self, db_setup):
        """Standups are returned newest first."""
        user, org, session = db_setup

        older = Standup(
            id=uuid4(), organization_id=org.id, created_by=user.id,
            today="Older", standup_date=date.today() - timedelta(days=2),
            blocker_ids=None,
        )
        newer = Standup(
            id=uuid4(), organization_id=org.id, created_by=user.id,
            today="Newer", standup_date=date.today() - timedelta(days=1),
            blocker_ids=None,
        )
        session.add_all([older, newer])
        session.commit()

        result = service.list_standups(session, org.id)
        assert result[0].standup_date > result[1].standup_date


class TestUpdateStandup:
    """Tests for service.update_standup."""

    def test_update_today_success(self, db_setup, sample_standup):
        """Updates today field when standup was created today."""
        user, org, session = db_setup
        updated = service.update_standup(session, sample_standup, "Updated content")
        assert updated.today == "Updated content"

    def test_update_with_none_does_not_change_today(self, db_setup, sample_standup):
        """Passing None for today leaves the field unchanged."""
        user, org, session = db_setup
        original_today = sample_standup.today
        updated = service.update_standup(session, sample_standup, None)
        assert updated.today == original_today

    def test_update_past_standup_raises_409(self, db_setup, past_standup):
        """Updating a standup from a past day raises 409 EDIT_WINDOW_EXPIRED."""
        from fastapi import HTTPException
        user, org, session = db_setup

        with pytest.raises(HTTPException) as exc_info:
            service.update_standup(session, past_standup, "Too late")
        assert exc_info.value.status_code == 409
        assert exc_info.value.detail["error"]["code"] == "EDIT_WINDOW_EXPIRED"


class TestDeleteStandup:
    """Tests for service.delete_standup."""

    def test_delete_removes_standup(self, db_setup, sample_standup):
        """Deleting a standup removes it from the database."""
        user, org, session = db_setup
        standup_id = sample_standup.id

        service.delete_standup(session, sample_standup)

        result = session.query(Standup).filter(Standup.id == standup_id).first()
        assert result is None


# ---------------------------------------------------------------------------
# Route tests
# ---------------------------------------------------------------------------

CREATE_URL = "/api/v1/organizations/{org_id}/standups"
LIST_URL = "/api/v1/organizations/{org_id}/standups"
UPDATE_URL = "/api/v1/standups/{standup_id}"
DELETE_URL = "/api/v1/standups/{standup_id}"


class TestCreateStandupRoute:
    """Tests for POST /organizations/{org_id}/standups."""

    def test_create_returns_201(self, client, db_setup):
        """Successful creation returns 201 with expected fields."""
        user, org, session = db_setup
        response = client.post(
            CREATE_URL.format(org_id=org.id),
            json={"today": "Working on the API today"},
        )
        assert response.status_code == 201
        data = response.json()
        assert data["today"] == "Working on the API today"
        assert "id" in data
        assert "created_at" in data
        assert "created_by" in data

    def test_create_response_has_created_by(self, client, db_setup):
        """Response includes created_by with id, name, avatar_url."""
        user, org, session = db_setup
        response = client.post(
            CREATE_URL.format(org_id=org.id),
            json={"today": "Test"},
        )
        data = response.json()
        assert data["created_by"]["id"] == str(user.id)
        assert data["created_by"]["name"] == user.name

    def test_create_non_member_org_returns_403(self, client):
        """Returns 403 when user tries to access an organization they don't belong to."""
        response = client.post(
            CREATE_URL.format(org_id=uuid4()),
            json={"today": "test"},
        )
        assert response.status_code == 403
        assert response.json()["detail"]["error"]["code"] == "FORBIDDEN"

    def test_create_duplicate_returns_409(self, client, db_setup, sample_standup):
        """Returns 409 when standup already exists for today."""
        user, org, session = db_setup
        response = client.post(
            CREATE_URL.format(org_id=org.id),
            json={"today": "Another standup today"},
        )
        assert response.status_code == 409
        assert response.json()["detail"]["error"]["code"] == "STANDUP_ALREADY_EXISTS"

    def test_create_empty_today_returns_422(self, client, db_setup):
        """Returns 422 when today field is empty."""
        user, org, session = db_setup
        response = client.post(
            CREATE_URL.format(org_id=org.id),
            json={"today": ""},
        )
        assert response.status_code == 422

    def test_create_missing_today_returns_422(self, client, db_setup):
        """Returns 422 when today field is missing."""
        user, org, session = db_setup
        response = client.post(
            CREATE_URL.format(org_id=org.id),
            json={},
        )
        assert response.status_code == 422


class TestListStandupsRoute:
    """Tests for GET /organizations/{org_id}/standups."""

    def test_list_returns_200(self, client, db_setup):
        """Returns 200 with a list."""
        user, org, session = db_setup
        response = client.get(LIST_URL.format(org_id=org.id))
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_list_returns_standups(self, client, db_setup, sample_standup):
        """Returns the standup created for the org."""
        user, org, session = db_setup
        response = client.get(LIST_URL.format(org_id=org.id))
        data = response.json()
        assert len(data) == 1
        assert data[0]["id"] == str(sample_standup.id)

    def test_list_response_has_blockers_field(self, client, db_setup, sample_standup):
        """Each standup in the list has a blockers field."""
        user, org, session = db_setup
        response = client.get(LIST_URL.format(org_id=org.id))
        data = response.json()
        assert "blockers" in data[0]

    def test_list_non_member_org_returns_403(self, client):
        """Returns 403 when user tries to list standups of an org they don't belong to."""
        response = client.get(LIST_URL.format(org_id=uuid4()))
        assert response.status_code == 403
        assert response.json()["detail"]["error"]["code"] == "FORBIDDEN"


class TestUpdateStandupRoute:
    """Tests for PATCH /standups/{standup_id}."""

    def test_update_returns_200(self, client, db_setup, sample_standup):
        """Successful update returns 200 with updated content."""
        response = client.patch(
            UPDATE_URL.format(standup_id=sample_standup.id),
            json={"today": "Updated today content"},
        )
        assert response.status_code == 200
        assert response.json()["today"] == "Updated today content"

    def test_update_past_standup_returns_409(self, client, db_setup, past_standup):
        """Returns 409 when trying to edit a past standup."""
        response = client.patch(
            UPDATE_URL.format(standup_id=past_standup.id),
            json={"today": "Too late to update"},
        )
        assert response.status_code == 409
        assert response.json()["detail"]["error"]["code"] == "EDIT_WINDOW_EXPIRED"

    def test_update_not_found_returns_404(self, client):
        """Returns 404 when standup does not exist."""
        response = client.patch(
            UPDATE_URL.format(standup_id=uuid4()),
            json={"today": "test"},
        )
        assert response.status_code == 404

    def test_update_empty_today_returns_422(self, client, db_setup, sample_standup):
        """Returns 422 when today is empty string."""
        response = client.patch(
            UPDATE_URL.format(standup_id=sample_standup.id),
            json={"today": ""},
        )
        assert response.status_code == 422


class TestDeleteStandupRoute:
    """Tests for DELETE /standups/{standup_id}."""

    def test_delete_returns_204(self, client, db_setup, sample_standup):
        """Successful deletion returns 204 No Content."""
        response = client.delete(DELETE_URL.format(standup_id=sample_standup.id))
        assert response.status_code == 204

    def test_delete_removes_standup(self, client, db_setup, sample_standup):
        """After deletion, standup no longer appears in list."""
        user, org, session = db_setup
        client.delete(DELETE_URL.format(standup_id=sample_standup.id))

        response = client.get(LIST_URL.format(org_id=org.id))
        assert len(response.json()) == 0

    def test_delete_not_found_returns_404(self, client):
        """Returns 404 when standup does not exist."""
        response = client.delete(DELETE_URL.format(standup_id=uuid4()))
        assert response.status_code == 404

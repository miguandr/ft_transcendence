"""
Unit tests for the tickets module (schemas, service, routes).

Tests cover:
- Schema validation (CreateTicketRequest, UpdateTicketRequest, MoveTicketRequest)
- Service business logic (create, list, get, update, move, delete)
- Route endpoints via TestClient (HTTP status codes and response shapes)

To run:
    docker-compose exec backend pytest tests/unit/tickets/ -v --tb=long
"""

import pytest
from uuid import uuid4

from src.tickets.schemas import (
	CreateTicketRequest,
	UpdateTicketRequest,
	MoveTicketRequest,
)
from src.tickets import service
from src.database.models import Ticket
from src.database.models.enums import TicketStatus, Priority


# ---------------------------------------------------------------------------
# Schema tests
# ---------------------------------------------------------------------------

class TestCreateTicketRequestSchema:
	"""Validate Pydantic schema rules for CreateTicketRequest."""

	def test_valid_request_is_accepted(self):
		"""Valid request with all required fields is accepted."""
		req = CreateTicketRequest(title="Implement login", priority=Priority.HIGH)
		assert req.title == "Implement login"
		assert req.priority == Priority.HIGH

	def test_optional_fields_default_to_none(self):
		"""description and assignee_id default to None."""
		req = CreateTicketRequest(title="Task", priority=Priority.MEDIUM)
		assert req.description is None
		assert req.assignee_id is None

	def test_empty_title_is_invalid(self):
		"""Empty title should fail validation (min_length=1)."""
		with pytest.raises(Exception):
			CreateTicketRequest(title="", priority=Priority.LOW)

	def test_missing_title_is_invalid(self):
		"""Missing title should fail validation."""
		with pytest.raises(Exception):
			CreateTicketRequest(priority=Priority.LOW)

	def test_missing_priority_is_invalid(self):
		"""Missing priority should fail validation."""
		with pytest.raises(Exception):
			CreateTicketRequest(title="Task")

	def test_invalid_priority_is_rejected(self):
		"""Invalid priority value should fail validation."""
		with pytest.raises(Exception):
			CreateTicketRequest(title="Task", priority="critical")

	def test_with_description_and_assignee(self):
		"""Request with all optional fields set is accepted."""
		uid = uuid4()
		req = CreateTicketRequest(
			title="Feature", description="Full feature", priority=Priority.LOW, assignee_id=uid
		)
		assert req.description == "Full feature"
		assert req.assignee_id == uid


class TestUpdateTicketRequestSchema:
	"""Validate Pydantic schema rules for UpdateTicketRequest."""

	def test_all_fields_optional(self):
		"""Empty request is valid — all fields are optional (partial update)."""
		req = UpdateTicketRequest()
		assert req.title is None
		assert req.description is None
		assert req.priority is None
		assert req.status is None
		assert req.assignee_id is None

	def test_valid_title_update(self):
		"""Single field update is accepted."""
		req = UpdateTicketRequest(title="Updated title")
		assert req.title == "Updated title"

	def test_empty_title_is_invalid(self):
		"""Empty title should fail (min_length=1)."""
		with pytest.raises(Exception):
			UpdateTicketRequest(title="")

	def test_valid_status_update(self):
		"""Valid status is accepted."""
		req = UpdateTicketRequest(status=TicketStatus.IN_PROGRESS)
		assert req.status == TicketStatus.IN_PROGRESS

	def test_invalid_status_is_rejected(self):
		"""Invalid status value should fail."""
		with pytest.raises(Exception):
			UpdateTicketRequest(status="archived")

	def test_valid_priority_update(self):
		"""Valid priority is accepted."""
		req = UpdateTicketRequest(priority=Priority.HIGH)
		assert req.priority == Priority.HIGH


class TestMoveTicketRequestSchema:
	"""Validate Pydantic schema rules for MoveTicketRequest."""

	def test_valid_status(self):
		"""Valid status is accepted."""
		req = MoveTicketRequest(status=TicketStatus.COMPLETED)
		assert req.status == TicketStatus.COMPLETED

	def test_missing_status_is_invalid(self):
		"""Missing status should fail."""
		with pytest.raises(Exception):
			MoveTicketRequest()

	def test_invalid_status_is_rejected(self):
		"""Invalid status should fail."""
		with pytest.raises(Exception):
			MoveTicketRequest(status="archived")


# ---------------------------------------------------------------------------
# Service tests
# ---------------------------------------------------------------------------

class TestGetTicketById:
	"""Tests for service.get_ticket_by_id."""

	def test_returns_ticket_when_found(self, db_setup, sample_ticket):
		"""Returns the ticket when ID exists."""
		user, org, session = db_setup
		result = service.get_ticket_by_id(sample_ticket.id, session)
		assert result.id == sample_ticket.id

	def test_raises_404_when_not_found(self, db_setup):
		"""Raises 404 HTTPException when ticket does not exist."""
		from fastapi import HTTPException
		user, org, session = db_setup
		with pytest.raises(HTTPException) as exc_info:
			service.get_ticket_by_id(uuid4(), session)
		assert exc_info.value.status_code == 404
		assert exc_info.value.detail["error"]["code"] == "NOT_FOUND"


class TestCreateTicket:
	"""Tests for service.create_ticket."""

	def test_create_ticket_success(self, db_setup):
		"""Creates a ticket with default TODO status."""
		user, org, session = db_setup
		ticket = service.create_ticket(
			session, org.id, user, "New ticket", "Description", Priority.HIGH, None
		)
		assert ticket.id is not None
		assert ticket.title == "New ticket"
		assert ticket.description == "Description"
		assert ticket.status == TicketStatus.TODO
		assert ticket.priority == Priority.HIGH
		assert ticket.created_by == user.id
		assert ticket.organization_id == org.id
		assert ticket.assignee_id is None

	def test_create_ticket_with_developer_assignee(self, db_setup, developer_user):
		"""Creates a ticket with a developer as assignee."""
		user, org, session = db_setup
		ticket = service.create_ticket(
			session, org.id, user, "Assigned ticket", None, Priority.MEDIUM, developer_user.id
		)
		assert ticket.assignee_id == developer_user.id

	def test_create_ticket_invalid_assignee_role_raises_400(self, db_setup, scrum_master_user):
		"""Raises 400 INVALID_ASSIGNEE when assignee is not a developer."""
		from fastapi import HTTPException
		user, org, session = db_setup
		with pytest.raises(HTTPException) as exc_info:
			service.create_ticket(
				session, org.id, user, "Ticket", None, Priority.MEDIUM, scrum_master_user.id
			)
		assert exc_info.value.status_code == 400
		assert exc_info.value.detail["error"]["code"] == "INVALID_ASSIGNEE"

	def test_create_ticket_po_assignee_raises_400(self, db_setup, product_owner_user):
		"""Raises 400 INVALID_ASSIGNEE when assignee is a product owner."""
		from fastapi import HTTPException
		user, org, session = db_setup
		with pytest.raises(HTTPException) as exc_info:
			service.create_ticket(
				session, org.id, user, "Ticket", None, Priority.LOW, product_owner_user.id
			)
		assert exc_info.value.status_code == 400
		assert exc_info.value.detail["error"]["code"] == "INVALID_ASSIGNEE"

	def test_create_ticket_assignee_not_found_raises_404(self, db_setup):
		"""Raises 404 when assignee user does not exist."""
		from fastapi import HTTPException
		user, org, session = db_setup
		with pytest.raises(HTTPException) as exc_info:
			service.create_ticket(
				session, org.id, user, "Ticket", None, Priority.MEDIUM, uuid4()
			)
		assert exc_info.value.status_code == 404

	def test_create_ticket_no_description(self, db_setup):
		"""Creates a ticket with description=None."""
		user, org, session = db_setup
		ticket = service.create_ticket(
			session, org.id, user, "No desc", None, Priority.LOW, None
		)
		assert ticket.description is None


class TestListTickets:
	"""Tests for service.list_tickets."""

	def test_returns_empty_list_when_no_tickets(self, db_setup):
		"""Returns empty list when org has no tickets."""
		user, org, session = db_setup
		result = service.list_tickets(session, org.id)
		assert result == []

	def test_returns_tickets_for_org(self, db_setup, sample_ticket):
		"""Returns tickets belonging to the organization."""
		user, org, session = db_setup
		result = service.list_tickets(session, org.id)
		assert len(result) == 1
		assert result[0].id == sample_ticket.id

	def test_filter_by_status(self, db_setup, sample_ticket, in_progress_ticket):
		"""?status=todo returns only TODO tickets."""
		user, org, session = db_setup
		result = service.list_tickets(session, org.id, status_filter=TicketStatus.TODO)
		ids = [t.id for t in result]
		assert sample_ticket.id in ids
		assert in_progress_ticket.id not in ids

	def test_filter_by_priority(self, db_setup, sample_ticket, in_progress_ticket):
		"""?priority=high returns only HIGH priority tickets."""
		user, org, session = db_setup
		result = service.list_tickets(session, org.id, priority_filter=Priority.HIGH)
		ids = [t.id for t in result]
		assert in_progress_ticket.id in ids
		assert sample_ticket.id not in ids

	def test_no_filter_returns_all(self, db_setup, sample_ticket, in_progress_ticket, completed_ticket):
		"""No filter returns all tickets."""
		user, org, session = db_setup
		result = service.list_tickets(session, org.id)
		assert len(result) == 3

	def test_ordered_by_created_at_descending(self, db_setup):
		"""Tickets are returned newest first."""
		from datetime import datetime, timezone, timedelta
		user, org, session = db_setup
		now = datetime.now(timezone.utc)
		t1 = Ticket(
			id=uuid4(), title="First", organization_id=org.id,
			created_by=user.id, status=TicketStatus.TODO, priority=Priority.LOW,
			created_at=now - timedelta(minutes=5),
		)
		t2 = Ticket(
			id=uuid4(), title="Second", organization_id=org.id,
			created_by=user.id, status=TicketStatus.TODO, priority=Priority.LOW,
			created_at=now,
		)
		session.add_all([t1, t2])
		session.commit()

		result = service.list_tickets(session, org.id)
		assert result[0].title == "Second"
		assert result[1].title == "First"


class TestUpdateTicket:
	"""Tests for service.update_ticket."""

	def test_update_title(self, db_setup, sample_ticket):
		"""Updates title when provided."""
		user, org, session = db_setup
		updated = service.update_ticket(session, sample_ticket, user, {"title": "New Title"})
		assert updated.title == "New Title"

	def test_update_description(self, db_setup, sample_ticket):
		"""Updates description when provided."""
		user, org, session = db_setup
		updated = service.update_ticket(session, sample_ticket, user, {"description": "New description"})
		assert updated.description == "New description"

	def test_update_priority(self, db_setup, sample_ticket):
		"""Product owner can update priority."""
		user, org, session = db_setup
		updated = service.update_ticket(session, sample_ticket, user, {"priority": Priority.HIGH})
		assert updated.priority == Priority.HIGH

	def test_update_status(self, db_setup, sample_ticket):
		"""Updates status when provided."""
		user, org, session = db_setup
		updated = service.update_ticket(
			session, sample_ticket, user, {"status": TicketStatus.IN_PROGRESS}
		)
		assert updated.status == TicketStatus.IN_PROGRESS

	def test_update_assignee_with_developer(self, db_setup, sample_ticket, developer_user):
		"""Sets assignee_id when assignee is a developer."""
		user, org, session = db_setup
		updated = service.update_ticket(
			session, sample_ticket, user, {"assignee_id": developer_user.id}
		)
		assert updated.assignee_id == developer_user.id

	def test_update_assignee_unset_to_none(self, db_setup, sample_ticket, developer_user):
		"""Setting assignee_id to None clears the assignee."""
		user, org, session = db_setup
		service.update_ticket(session, sample_ticket, user, {"assignee_id": developer_user.id})
		updated = service.update_ticket(session, sample_ticket, user, {"assignee_id": None})
		assert updated.assignee_id is None

	def test_update_invalid_assignee_raises_400(self, db_setup, sample_ticket, scrum_master_user):
		"""Raises 400 INVALID_ASSIGNEE when assignee is not a developer."""
		from fastapi import HTTPException
		user, org, session = db_setup
		with pytest.raises(HTTPException) as exc_info:
			service.update_ticket(
				session, sample_ticket, user, {"assignee_id": scrum_master_user.id}
			)
		assert exc_info.value.status_code == 400
		assert exc_info.value.detail["error"]["code"] == "INVALID_ASSIGNEE"

	def test_empty_updates_changes_nothing(self, db_setup, sample_ticket):
		"""Empty updates dict leaves ticket unchanged."""
		user, org, session = db_setup
		original_title = sample_ticket.title
		updated = service.update_ticket(session, sample_ticket, user, {})
		assert updated.title == original_title

	def test_scrum_master_cannot_update_priority(self, db_setup, sample_ticket, scrum_master_user):
		"""Scrum master is denied from changing priority (restricted_fields)."""
		from fastapi import HTTPException
		user, org, session = db_setup
		with pytest.raises(HTTPException) as exc_info:
			service.update_ticket(
				session, sample_ticket, scrum_master_user, {"priority": Priority.LOW}
			)
		assert exc_info.value.status_code == 403
		assert exc_info.value.detail["error"]["code"] == "FORBIDDEN"

	def test_multiple_fields_update(self, db_setup, sample_ticket):
		"""Multiple fields can be updated at once."""
		user, org, session = db_setup
		updated = service.update_ticket(session, sample_ticket, user, {
			"title": "Updated",
			"description": "Updated desc",
			"priority": Priority.LOW,
		})
		assert updated.title == "Updated"
		assert updated.description == "Updated desc"
		assert updated.priority == Priority.LOW


class TestMoveTicket:
	"""Tests for service.move_ticket."""

	def test_move_to_in_progress(self, db_setup, sample_ticket):
		"""Moves ticket from TODO to IN_PROGRESS."""
		user, org, session = db_setup
		moved = service.move_ticket(session, sample_ticket, TicketStatus.IN_PROGRESS)
		assert moved.status == TicketStatus.IN_PROGRESS

	def test_move_to_completed(self, db_setup, in_progress_ticket):
		"""Moves ticket from IN_PROGRESS to COMPLETED."""
		user, org, session = db_setup
		moved = service.move_ticket(session, in_progress_ticket, TicketStatus.COMPLETED)
		assert moved.status == TicketStatus.COMPLETED

	def test_move_back_to_todo(self, db_setup, in_progress_ticket):
		"""Moves ticket back to TODO."""
		user, org, session = db_setup
		moved = service.move_ticket(session, in_progress_ticket, TicketStatus.TODO)
		assert moved.status == TicketStatus.TODO


class TestDeleteTicket:
	"""Tests for service.delete_ticket."""

	def test_delete_removes_ticket(self, db_setup, sample_ticket):
		"""Deleting a ticket removes it from the database."""
		user, org, session = db_setup
		ticket_id = sample_ticket.id
		service.delete_ticket(session, sample_ticket)
		result = session.query(Ticket).filter(Ticket.id == ticket_id).first()
		assert result is None


# ---------------------------------------------------------------------------
# Route tests
# ---------------------------------------------------------------------------

CREATE_URL = "/api/v1/organizations/{org_id}/tickets"
LIST_URL = "/api/v1/organizations/{org_id}/tickets"
DETAIL_URL = "/api/v1/tickets/{ticket_id}"
UPDATE_URL = "/api/v1/tickets/{ticket_id}"
MOVE_URL = "/api/v1/tickets/{ticket_id}/move"
DELETE_URL = "/api/v1/tickets/{ticket_id}"


class TestCreateTicketRoute:
	"""Tests for POST /organizations/{org_id}/tickets."""

	def test_create_returns_201(self, client, db_setup):
		"""Successful creation returns 201 with expected fields."""
		user, org, session = db_setup
		response = client.post(
			CREATE_URL.format(org_id=org.id),
			json={"title": "New ticket", "priority": "medium"},
		)
		assert response.status_code == 201
		data = response.json()
		assert data["title"] == "New ticket"
		assert data["status"] == "todo"
		assert data["priority"] == "medium"
		assert "id" in data
		assert "created_at" in data
		assert "updated_at" in data

	def test_create_response_has_created_by(self, client, db_setup):
		"""Response includes created_by with id, name, avatar_url."""
		user, org, session = db_setup
		response = client.post(
			CREATE_URL.format(org_id=org.id),
			json={"title": "Test", "priority": "low"},
		)
		data = response.json()
		assert data["created_by"]["id"] == str(user.id)
		assert data["created_by"]["name"] == user.name

	def test_create_response_has_organization_id(self, client, db_setup):
		"""Response includes organization_id matching the path parameter."""
		user, org, session = db_setup
		response = client.post(
			CREATE_URL.format(org_id=org.id),
			json={"title": "Test", "priority": "high"},
		)
		data = response.json()
		assert data["organization_id"] == str(org.id)

	def test_create_with_description(self, client, db_setup):
		"""Creates a ticket with description."""
		user, org, session = db_setup
		response = client.post(
			CREATE_URL.format(org_id=org.id),
			json={"title": "Test", "priority": "medium", "description": "Full description"},
		)
		assert response.status_code == 201
		assert response.json()["description"] == "Full description"

	def test_create_with_developer_assignee(self, client, db_setup, developer_user):
		"""Creates a ticket with a valid developer assignee."""
		user, org, session = db_setup
		response = client.post(
			CREATE_URL.format(org_id=org.id),
			json={
				"title": "Assigned ticket",
				"priority": "medium",
				"assignee_id": str(developer_user.id),
			},
		)
		assert response.status_code == 201
		assert response.json()["assignee_id"] == str(developer_user.id)

	def test_create_invalid_assignee_returns_400(self, client, db_setup, scrum_master_user):
		"""Returns 400 when assignee does not have Developer role."""
		user, org, session = db_setup
		response = client.post(
			CREATE_URL.format(org_id=org.id),
			json={
				"title": "Ticket",
				"priority": "medium",
				"assignee_id": str(scrum_master_user.id),
			},
		)
		assert response.status_code == 400
		assert response.json()["detail"]["error"]["code"] == "INVALID_ASSIGNEE"

	def test_create_non_member_org_returns_403(self, client):
		"""Returns 403 when user tries to create a ticket in an org they don't belong to."""
		response = client.post(
			CREATE_URL.format(org_id=uuid4()),
			json={"title": "test", "priority": "low"},
		)
		assert response.status_code == 403
		assert response.json()["detail"]["error"]["code"] == "FORBIDDEN"

	def test_create_org_not_found_returns_404(self, client, db_setup):
		"""Returns 404 when org_id doesn't match any organization in the DB."""
		user, org, session = db_setup
		fake_org_id = uuid4()
		user.organization_id = fake_org_id
		session.commit()
		response = client.post(
			CREATE_URL.format(org_id=fake_org_id),
			json={"title": "test", "priority": "low"},
		)
		assert response.status_code == 404

	def test_create_empty_title_returns_422(self, client, db_setup):
		"""Returns 422 when title is empty."""
		user, org, session = db_setup
		response = client.post(
			CREATE_URL.format(org_id=org.id),
			json={"title": "", "priority": "medium"},
		)
		assert response.status_code == 422

	def test_create_missing_title_returns_422(self, client, db_setup):
		"""Returns 422 when title field is missing."""
		user, org, session = db_setup
		response = client.post(
			CREATE_URL.format(org_id=org.id),
			json={"priority": "medium"},
		)
		assert response.status_code == 422

	def test_create_missing_priority_returns_422(self, client, db_setup):
		"""Returns 422 when priority field is missing."""
		user, org, session = db_setup
		response = client.post(
			CREATE_URL.format(org_id=org.id),
			json={"title": "Test"},
		)
		assert response.status_code == 422

	def test_create_invalid_priority_returns_422(self, client, db_setup):
		"""Returns 422 when priority has an invalid value."""
		user, org, session = db_setup
		response = client.post(
			CREATE_URL.format(org_id=org.id),
			json={"title": "Test", "priority": "critical"},
		)
		assert response.status_code == 422


class TestListTicketsRoute:
	"""Tests for GET /organizations/{org_id}/tickets."""

	def test_list_returns_200(self, client, db_setup):
		"""Returns 200 with a list."""
		user, org, session = db_setup
		response = client.get(LIST_URL.format(org_id=org.id))
		assert response.status_code == 200
		assert isinstance(response.json(), list)

	def test_list_returns_empty_when_no_tickets(self, client, db_setup):
		"""Returns empty list when there are no tickets."""
		user, org, session = db_setup
		response = client.get(LIST_URL.format(org_id=org.id))
		assert response.json() == []

	def test_list_returns_tickets(self, client, db_setup, sample_ticket):
		"""Returns tickets created for the org."""
		user, org, session = db_setup
		response = client.get(LIST_URL.format(org_id=org.id))
		data = response.json()
		assert len(data) == 1
		assert data[0]["id"] == str(sample_ticket.id)
		assert data[0]["title"] == sample_ticket.title

	def test_list_response_shape(self, client, db_setup, sample_ticket):
		"""Each item has the expected TicketBriefList fields."""
		user, org, session = db_setup
		response = client.get(LIST_URL.format(org_id=org.id))
		data = response.json()[0]
		assert "id" in data
		assert "title" in data
		assert "status" in data
		assert "priority" in data
		assert "created_at" in data
		assert "updated_at" in data

	def test_list_filter_by_status(self, client, db_setup, sample_ticket, in_progress_ticket):
		"""?status=todo returns only TODO tickets."""
		user, org, session = db_setup
		response = client.get(LIST_URL.format(org_id=org.id) + "?status=todo")
		data = response.json()
		assert all(t["status"] == "todo" for t in data)
		ids = [t["id"] for t in data]
		assert str(sample_ticket.id) in ids
		assert str(in_progress_ticket.id) not in ids

	def test_list_filter_by_priority(self, client, db_setup, sample_ticket, in_progress_ticket):
		"""?priority=high returns only HIGH priority tickets."""
		user, org, session = db_setup
		response = client.get(LIST_URL.format(org_id=org.id) + "?priority=high")
		data = response.json()
		assert all(t["priority"] == "high" for t in data)
		ids = [t["id"] for t in data]
		assert str(in_progress_ticket.id) in ids
		assert str(sample_ticket.id) not in ids

	def test_list_non_member_org_returns_403(self, client):
		"""Returns 403 when user tries to list tickets of an org they don't belong to."""
		response = client.get(LIST_URL.format(org_id=uuid4()))
		assert response.status_code == 403
		assert response.json()["detail"]["error"]["code"] == "FORBIDDEN"


class TestGetTicketDetailRoute:
	"""Tests for GET /tickets/{ticket_id}."""

	def test_detail_returns_200(self, client, db_setup, sample_ticket):
		"""Returns 200 with ticket details."""
		response = client.get(DETAIL_URL.format(ticket_id=sample_ticket.id))
		assert response.status_code == 200

	def test_detail_response_has_all_fields(self, client, db_setup, sample_ticket):
		"""Response includes all TicketDetailResponse fields."""
		user, org, session = db_setup
		response = client.get(DETAIL_URL.format(ticket_id=sample_ticket.id))
		data = response.json()
		assert data["id"] == str(sample_ticket.id)
		assert data["title"] == sample_ticket.title
		assert data["description"] == sample_ticket.description
		assert data["status"] == "todo"
		assert data["priority"] == "medium"
		assert data["organization_id"] == str(org.id)
		assert "created_by" in data
		assert "created_at" in data
		assert "updated_at" in data
		assert "tasks" in data
		assert "blockers" in data

	def test_detail_has_created_by_user_brief(self, client, db_setup, sample_ticket):
		"""created_by field is a UserBrief with id, name, avatar_url."""
		user, org, session = db_setup
		response = client.get(DETAIL_URL.format(ticket_id=sample_ticket.id))
		created_by = response.json()["created_by"]
		assert created_by["id"] == str(user.id)
		assert created_by["name"] == user.name
		assert "avatar_url" in created_by

	def test_detail_empty_tasks_and_blockers(self, client, db_setup, sample_ticket):
		"""Returns empty lists when ticket has no tasks or blockers."""
		response = client.get(DETAIL_URL.format(ticket_id=sample_ticket.id))
		data = response.json()
		assert data["tasks"] == []
		assert data["blockers"] == []

	def test_detail_includes_tasks(self, client, db_setup, sample_ticket, sample_task):
		"""Returns tasks linked to the ticket with id, title, status."""
		response = client.get(DETAIL_URL.format(ticket_id=sample_ticket.id))
		data = response.json()
		assert len(data["tasks"]) == 1
		task = data["tasks"][0]
		assert task["id"] == str(sample_task.id)
		assert task["title"] == sample_task.title
		assert task["status"] == "in_progress"

	def test_detail_includes_blockers(self, client, db_setup, sample_ticket, sample_blocker):
		"""Returns blockers linked to the ticket with id, description, status."""
		response = client.get(DETAIL_URL.format(ticket_id=sample_ticket.id))
		data = response.json()
		assert len(data["blockers"]) == 1
		blocker = data["blockers"][0]
		assert blocker["id"] == str(sample_blocker.id)
		assert blocker["description"] == sample_blocker.description
		assert blocker["status"] == "open"

	def test_detail_includes_tasks_and_blockers(self, client, db_setup, sample_ticket, sample_task, sample_blocker):
		"""Returns both tasks and blockers when ticket has both."""
		response = client.get(DETAIL_URL.format(ticket_id=sample_ticket.id))
		data = response.json()
		assert len(data["tasks"]) == 1
		assert len(data["blockers"]) == 1

	def test_detail_not_found_returns_404(self, client):
		"""Returns 404 when ticket does not exist."""
		response = client.get(DETAIL_URL.format(ticket_id=uuid4()))
		assert response.status_code == 404


class TestUpdateTicketRoute:
	"""Tests for PATCH /tickets/{ticket_id}."""

	def test_update_title_returns_200(self, client, db_setup, sample_ticket):
		"""Successful title update returns 200."""
		response = client.patch(
			UPDATE_URL.format(ticket_id=sample_ticket.id),
			json={"title": "Updated Title"},
		)
		assert response.status_code == 200
		assert response.json()["title"] == "Updated Title"

	def test_update_description_returns_200(self, client, db_setup, sample_ticket):
		"""Successful description update returns 200."""
		response = client.patch(
			UPDATE_URL.format(ticket_id=sample_ticket.id),
			json={"description": "New description"},
		)
		assert response.status_code == 200
		assert response.json()["description"] == "New description"

	def test_update_priority_returns_200(self, client, db_setup, sample_ticket):
		"""Successful priority update returns 200 (admin/PO user)."""
		response = client.patch(
			UPDATE_URL.format(ticket_id=sample_ticket.id),
			json={"priority": "high"},
		)
		assert response.status_code == 200
		assert response.json()["priority"] == "high"

	def test_update_status_returns_200(self, client, db_setup, sample_ticket):
		"""Successful status update returns 200."""
		response = client.patch(
			UPDATE_URL.format(ticket_id=sample_ticket.id),
			json={"status": "in_progress"},
		)
		assert response.status_code == 200
		assert response.json()["status"] == "in_progress"

	def test_update_assignee_returns_200(self, client, db_setup, sample_ticket, developer_user):
		"""Successful assignee update returns 200."""
		response = client.patch(
			UPDATE_URL.format(ticket_id=sample_ticket.id),
			json={"assignee_id": str(developer_user.id)},
		)
		assert response.status_code == 200
		assert response.json()["assignee_id"] == str(developer_user.id)

	def test_update_response_has_all_fields(self, client, db_setup, sample_ticket):
		"""Response includes all UpdateTicketResponse fields."""
		user, org, session = db_setup
		response = client.patch(
			UPDATE_URL.format(ticket_id=sample_ticket.id),
			json={"title": "Check fields"},
		)
		data = response.json()
		assert "id" in data
		assert "title" in data
		assert "description" in data
		assert "status" in data
		assert "priority" in data
		assert "created_by" in data
		assert "organization_id" in data
		assert "created_at" in data
		assert "updated_at" in data

	def test_update_empty_body_returns_200(self, client, db_setup, sample_ticket):
		"""Empty body is valid — all fields are optional."""
		response = client.patch(
			UPDATE_URL.format(ticket_id=sample_ticket.id),
			json={},
		)
		assert response.status_code == 200

	def test_update_invalid_assignee_returns_400(self, client, db_setup, sample_ticket, scrum_master_user):
		"""Returns 400 when assigning a non-developer user."""
		response = client.patch(
			UPDATE_URL.format(ticket_id=sample_ticket.id),
			json={"assignee_id": str(scrum_master_user.id)},
		)
		assert response.status_code == 400
		assert response.json()["detail"]["error"]["code"] == "INVALID_ASSIGNEE"

	def test_update_not_found_returns_404(self, client):
		"""Returns 404 when ticket does not exist."""
		response = client.patch(
			UPDATE_URL.format(ticket_id=uuid4()),
			json={"title": "test"},
		)
		assert response.status_code == 404

	def test_update_empty_title_returns_422(self, client, db_setup, sample_ticket):
		"""Returns 422 when title is empty string."""
		response = client.patch(
			UPDATE_URL.format(ticket_id=sample_ticket.id),
			json={"title": ""},
		)
		assert response.status_code == 422

	def test_update_invalid_status_returns_422(self, client, db_setup, sample_ticket):
		"""Returns 422 when status has an invalid value."""
		response = client.patch(
			UPDATE_URL.format(ticket_id=sample_ticket.id),
			json={"status": "archived"},
		)
		assert response.status_code == 422


class TestMoveTicketRoute:
	"""Tests for PATCH /tickets/{ticket_id}/move."""

	def test_move_returns_200(self, client, db_setup, sample_ticket):
		"""Successful move returns 200 with id, status, updated_at."""
		response = client.patch(
			MOVE_URL.format(ticket_id=sample_ticket.id),
			json={"status": "in_progress"},
		)
		assert response.status_code == 200
		data = response.json()
		assert data["id"] == str(sample_ticket.id)
		assert data["status"] == "in_progress"
		assert "updated_at" in data

	def test_move_to_completed(self, client, db_setup, sample_ticket):
		"""Moves ticket to completed."""
		response = client.patch(
			MOVE_URL.format(ticket_id=sample_ticket.id),
			json={"status": "completed"},
		)
		assert response.status_code == 200
		assert response.json()["status"] == "completed"

	def test_move_back_to_todo(self, client, db_setup, in_progress_ticket):
		"""Moves ticket back to todo."""
		response = client.patch(
			MOVE_URL.format(ticket_id=in_progress_ticket.id),
			json={"status": "todo"},
		)
		assert response.status_code == 200
		assert response.json()["status"] == "todo"

	def test_move_not_found_returns_404(self, client):
		"""Returns 404 when ticket does not exist."""
		response = client.patch(
			MOVE_URL.format(ticket_id=uuid4()),
			json={"status": "todo"},
		)
		assert response.status_code == 404

	def test_move_missing_status_returns_422(self, client, db_setup, sample_ticket):
		"""Returns 422 when status field is missing."""
		response = client.patch(
			MOVE_URL.format(ticket_id=sample_ticket.id),
			json={},
		)
		assert response.status_code == 422

	def test_move_invalid_status_returns_422(self, client, db_setup, sample_ticket):
		"""Returns 422 when status has an invalid value."""
		response = client.patch(
			MOVE_URL.format(ticket_id=sample_ticket.id),
			json={"status": "archived"},
		)
		assert response.status_code == 422


class TestDeleteTicketRoute:
	"""Tests for DELETE /tickets/{ticket_id}."""

	def test_delete_returns_204(self, client, db_setup, sample_ticket):
		"""Successful deletion returns 204 No Content."""
		response = client.delete(DELETE_URL.format(ticket_id=sample_ticket.id))
		assert response.status_code == 204

	def test_delete_removes_ticket(self, client, db_setup, sample_ticket):
		"""After deletion, ticket no longer appears in list."""
		user, org, session = db_setup
		client.delete(DELETE_URL.format(ticket_id=sample_ticket.id))
		response = client.get(LIST_URL.format(org_id=org.id))
		assert len(response.json()) == 0

	def test_delete_not_found_returns_404(self, client):
		"""Returns 404 when ticket does not exist."""
		response = client.delete(DELETE_URL.format(ticket_id=uuid4()))
		assert response.status_code == 404

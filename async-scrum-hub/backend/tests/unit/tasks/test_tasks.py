"""
Unit tests for the tasks module (schemas, service, routes).

Tests cover:
- Schema validation (request/response)
- Service business logic (create, list, update, delete, validate_assignee)
- Route endpoints via TestClient (HTTP status codes and response shapes)

To run:
    docker-compose exec backend pytest tests/unit/tasks/ -v --tb=long
"""

import pytest
from uuid import uuid4

from src.tasks.schemas import (
	CreateTaskRequest,
	UpdateTaskRequest,
	TITLE_MAX_LENGTH,
	DESCRIPTION_MAX_LENGTH,
)
from src.tasks import service
from src.database.models import Task
from src.database.models.enums import TaskStatus


# ---------------------------------------------------------------------------
# Schema tests
# ---------------------------------------------------------------------------

class TestCreateTaskSchema:
	"""Validate Pydantic schema rules for task creation requests."""

	def test_valid_minimal_request(self):
		"""Title only is accepted; optional fields default to None."""
		req = CreateTaskRequest(title="Implement feature")
		assert req.title == "Implement feature"
		assert req.description is None
		assert req.assignee_id is None

	def test_valid_full_request(self):
		"""All fields provided are accepted."""
		uid = uuid4()
		req = CreateTaskRequest(title="Fix bug", description="Fix the login bug", assignee_id=uid)
		assert req.title == "Fix bug"
		assert req.description == "Fix the login bug"
		assert req.assignee_id == uid

	def test_empty_title_is_invalid(self):
		"""Empty string for title should fail validation (min_length=1)."""
		with pytest.raises(Exception):
			CreateTaskRequest(title="")

	def test_missing_title_is_invalid(self):
		"""Missing title field should fail validation."""
		with pytest.raises(Exception):
			CreateTaskRequest()

	def test_title_max_length_exceeded(self):
		"""Title exceeding max length should fail validation."""
		with pytest.raises(Exception):
			CreateTaskRequest(title="x" * (TITLE_MAX_LENGTH + 1))

	def test_title_at_max_length_is_valid(self):
		"""Title exactly at max length should be accepted."""
		req = CreateTaskRequest(title="x" * TITLE_MAX_LENGTH)
		assert len(req.title) == TITLE_MAX_LENGTH

	def test_description_max_length_exceeded(self):
		"""Description exceeding max length should fail validation."""
		with pytest.raises(Exception):
			CreateTaskRequest(title="Valid", description="x" * (DESCRIPTION_MAX_LENGTH + 1))

	def test_description_at_max_length_is_valid(self):
		"""Description exactly at max length should be accepted."""
		req = CreateTaskRequest(title="Valid", description="x" * DESCRIPTION_MAX_LENGTH)
		assert len(req.description) == DESCRIPTION_MAX_LENGTH


class TestUpdateTaskSchema:
	"""Validate Pydantic schema rules for task update requests."""

	def test_all_fields_optional(self):
		"""Update request with no fields should be valid."""
		req = UpdateTaskRequest()
		assert req.description is None
		assert req.status is None
		assert req.assignee_id is None

	def test_update_title(self):
		"""Update request with title provided is valid."""
		req = UpdateTaskRequest(title="Updated title")
		assert req.title == "Updated title"

	def test_update_empty_title_is_invalid(self):
		"""Empty string for title should fail (min_length=1)."""
		with pytest.raises(Exception):
			UpdateTaskRequest(title="")

	def test_update_title_null_is_rejected(self):
		"""Explicitly setting title to null should fail (field_validator)."""
		with pytest.raises(Exception):
			UpdateTaskRequest.model_validate({"title": None})

	def test_update_status_in_progress(self):
		"""Setting status to in_progress is valid."""
		req = UpdateTaskRequest(status=TaskStatus.IN_PROGRESS)
		assert req.status == TaskStatus.IN_PROGRESS

	def test_update_status_completed(self):
		"""Setting status to completed is valid."""
		req = UpdateTaskRequest(status=TaskStatus.COMPLETED)
		assert req.status == TaskStatus.COMPLETED

	def test_update_title_max_length_exceeded(self):
		"""Title exceeding max length should fail validation."""
		with pytest.raises(Exception):
			UpdateTaskRequest(title="x" * (TITLE_MAX_LENGTH + 1))

	def test_update_description_max_length_exceeded(self):
		"""Description exceeding max length should fail validation."""
		with pytest.raises(Exception):
			UpdateTaskRequest(description="x" * (DESCRIPTION_MAX_LENGTH + 1))

	def test_exclude_unset_omits_unset_fields(self):
		"""model_dump(exclude_unset=True) only includes explicitly set fields."""
		req = UpdateTaskRequest(title="New title")
		dumped = req.model_dump(exclude_unset=True)
		assert "title" in dumped
		assert "description" not in dumped
		assert "status" not in dumped
		assert "assignee_id" not in dumped


# ---------------------------------------------------------------------------
# Service tests
# ---------------------------------------------------------------------------

class TestValidateAssignee:
	"""Tests for service.validate_assignee."""

	def test_none_assignee_is_valid(self, db_setup):
		"""None assignee_id should pass without error."""
		user, org, session = db_setup
		service.validate_assignee(session, None, org.id)  # Should not raise

	def test_developer_assignee_is_valid(self, db_setup, developer_user):
		"""A user with the developer role should pass validation."""
		user, org, session = db_setup
		service.validate_assignee(session, developer_user.id, org.id)  # Should not raise

	def test_scrum_master_assignee_raises_400(self, db_setup, scrum_master_user):
		"""A scrum master should fail assignee validation with 400."""
		from fastapi import HTTPException
		user, org, session = db_setup
		with pytest.raises(HTTPException) as exc_info:
			service.validate_assignee(session, scrum_master_user.id, org.id)
		assert exc_info.value.status_code == 400
		assert exc_info.value.detail["error"]["code"] == "INVALID_ASSIGNEE"

	def test_product_owner_assignee_raises_400(self, db_setup, product_owner_user):
		"""A product owner should fail assignee validation with 400."""
		from fastapi import HTTPException
		user, org, session = db_setup
		with pytest.raises(HTTPException) as exc_info:
			service.validate_assignee(session, product_owner_user.id, org.id)
		assert exc_info.value.status_code == 400
		assert exc_info.value.detail["error"]["code"] == "INVALID_ASSIGNEE"

	def test_nonexistent_assignee_raises_404(self, db_setup):
		"""A non-existent user ID should raise 404."""
		from fastapi import HTTPException
		user, org, session = db_setup
		with pytest.raises(HTTPException) as exc_info:
			service.validate_assignee(session, uuid4(), org.id)
		assert exc_info.value.status_code == 404

	def test_assignee_from_different_org_raises_403(self, db_setup):
		"""An assignee from a different organization should raise 403."""
		from fastapi import HTTPException
		user, org, session = db_setup
		# The main user belongs to org; use a different org_id
		with pytest.raises(HTTPException) as exc_info:
			service.validate_assignee(session, user.id, uuid4())
		assert exc_info.value.status_code == 403


class TestCreateTask:
	"""Tests for service.create_task."""

	def test_create_task_success(self, db_setup, sample_ticket):
		"""Creates a task and returns it with correct fields."""
		user, org, session = db_setup
		task = service.create_task(
			db=session,
			current_user=user,
			ticket=sample_ticket,
			title="Write tests",
			description="Write unit tests for the task module",
			assignee_id=None,
		)
		assert task.id is not None
		assert task.title == "Write tests"
		assert task.description == "Write unit tests for the task module"
		assert task.status == TaskStatus.IN_PROGRESS
		assert task.created_by == user.id
		assert task.assignee_id is None
		assert task.ticket_id == sample_ticket.id
		assert task.organization_id == org.id

	def test_create_task_with_developer_assignee(self, db_setup, sample_ticket, developer_user):
		"""Creates a task assigned to a developer."""
		user, org, session = db_setup
		task = service.create_task(
			db=session,
			current_user=user,
			ticket=sample_ticket,
			title="Assigned task",
			description=None,
			assignee_id=developer_user.id,
		)
		assert task.assignee_id == developer_user.id

	def test_create_task_with_scrum_master_assignee_raises_400(self, db_setup, sample_ticket, scrum_master_user):
		"""Raises 400 when assigning task to a scrum master."""
		from fastapi import HTTPException
		user, org, session = db_setup
		with pytest.raises(HTTPException) as exc_info:
			service.create_task(
				db=session,
				current_user=user,
				ticket=sample_ticket,
				title="Bad assignment",
				description=None,
				assignee_id=scrum_master_user.id,
			)
		assert exc_info.value.status_code == 400
		assert exc_info.value.detail["error"]["code"] == "INVALID_ASSIGNEE"

	def test_create_task_with_nonexistent_assignee_raises_404(self, db_setup, sample_ticket):
		"""Raises 404 when assignee does not exist."""
		from fastapi import HTTPException
		user, org, session = db_setup
		with pytest.raises(HTTPException) as exc_info:
			service.create_task(
				db=session,
				current_user=user,
				ticket=sample_ticket,
				title="Ghost assignee",
				description=None,
				assignee_id=uuid4(),
			)
		assert exc_info.value.status_code == 404

	def test_create_task_no_description(self, db_setup, sample_ticket):
		"""Creates a task with description=None."""
		user, org, session = db_setup
		task = service.create_task(
			db=session,
			current_user=user,
			ticket=sample_ticket,
			title="No description",
			description=None,
			assignee_id=None,
		)
		assert task.description is None

	def test_create_task_defaults_to_in_progress(self, db_setup, sample_ticket):
		"""Newly created task always has status IN_PROGRESS."""
		user, org, session = db_setup
		task = service.create_task(
			db=session,
			current_user=user,
			ticket=sample_ticket,
			title="Status check",
			description=None,
			assignee_id=None,
		)
		assert task.status == TaskStatus.IN_PROGRESS


class TestListTasks:
	"""Tests for service.list_tasks."""

	def test_returns_empty_list_when_no_tasks(self, db_setup, sample_ticket):
		"""Returns empty list when ticket has no tasks."""
		user, org, session = db_setup
		result = service.list_tasks(db=session, ticket=sample_ticket, status_filter=None)
		assert result == []

	def test_returns_tasks_for_ticket(self, db_setup, sample_ticket, sample_task):
		"""Returns tasks belonging to the ticket."""
		user, org, session = db_setup
		result = service.list_tasks(db=session, ticket=sample_ticket, status_filter=None)
		assert len(result) == 1
		assert result[0].id == sample_task.id

	def test_filter_in_progress(self, db_setup, sample_ticket, sample_task, completed_task):
		"""status=in_progress returns only in-progress tasks."""
		user, org, session = db_setup
		result = service.list_tasks(db=session, ticket=sample_ticket, status_filter=TaskStatus.IN_PROGRESS)
		ids = [t.id for t in result]
		assert sample_task.id in ids
		assert completed_task.id not in ids

	def test_filter_completed(self, db_setup, sample_ticket, sample_task, completed_task):
		"""status=completed returns only completed tasks."""
		user, org, session = db_setup
		result = service.list_tasks(db=session, ticket=sample_ticket, status_filter=TaskStatus.COMPLETED)
		ids = [t.id for t in result]
		assert completed_task.id in ids
		assert sample_task.id not in ids

	def test_no_filter_returns_all(self, db_setup, sample_ticket, sample_task, completed_task):
		"""No filter returns all tasks."""
		user, org, session = db_setup
		result = service.list_tasks(db=session, ticket=sample_ticket, status_filter=None)
		assert len(result) == 2


class TestUpdateTask:
	"""Tests for service.update_task."""

	def test_update_title(self, db_setup, sample_task):
		"""Updates title when provided."""
		user, org, session = db_setup
		updated = service.update_task(db=session, task=sample_task, updates={"title": "New title"})
		assert updated.title == "New title"

	def test_update_description(self, db_setup, sample_task):
		"""Updates description when provided."""
		user, org, session = db_setup
		updated = service.update_task(db=session, task=sample_task, updates={"description": "New description"})
		assert updated.description == "New description"

	def test_update_status_to_completed(self, db_setup, sample_task):
		"""Updates status to completed."""
		user, org, session = db_setup
		updated = service.update_task(db=session, task=sample_task, updates={"status": TaskStatus.COMPLETED})
		assert updated.status == TaskStatus.COMPLETED

	def test_update_assignee_to_developer(self, db_setup, sample_task, developer_user):
		"""Sets assignee_id when assignee is a developer."""
		user, org, session = db_setup
		updated = service.update_task(db=session, task=sample_task, updates={"assignee_id": developer_user.id})
		assert updated.assignee_id == developer_user.id

	def test_update_unsets_assignee_when_null(self, db_setup, sample_task, developer_user):
		"""Setting assignee_id to None clears the assignee."""
		user, org, session = db_setup
		service.update_task(db=session, task=sample_task, updates={"assignee_id": developer_user.id})
		updated = service.update_task(db=session, task=sample_task, updates={"assignee_id": None})
		assert updated.assignee_id is None

	def test_update_invalid_assignee_role_raises_400(self, db_setup, sample_task, scrum_master_user):
		"""Raises 400 INVALID_ASSIGNEE when new assignee is not a developer."""
		from fastapi import HTTPException
		user, org, session = db_setup
		with pytest.raises(HTTPException) as exc_info:
			service.update_task(db=session, task=sample_task, updates={"assignee_id": scrum_master_user.id})
		assert exc_info.value.status_code == 400
		assert exc_info.value.detail["error"]["code"] == "INVALID_ASSIGNEE"

	def test_update_nonexistent_assignee_raises_404(self, db_setup, sample_task):
		"""Raises 404 when assignee does not exist."""
		from fastapi import HTTPException
		user, org, session = db_setup
		with pytest.raises(HTTPException) as exc_info:
			service.update_task(db=session, task=sample_task, updates={"assignee_id": uuid4()})
		assert exc_info.value.status_code == 404

	def test_empty_updates_changes_nothing(self, db_setup, sample_task):
		"""Empty updates dict returns task unchanged (short-circuit)."""
		user, org, session = db_setup
		original_title = sample_task.title
		updated = service.update_task(db=session, task=sample_task, updates={})
		assert updated.title == original_title

	def test_update_multiple_fields(self, db_setup, sample_task):
		"""Can update multiple fields at once."""
		user, org, session = db_setup
		updated = service.update_task(
			db=session,
			task=sample_task,
			updates={"title": "Multi update", "status": TaskStatus.COMPLETED},
		)
		assert updated.title == "Multi update"
		assert updated.status == TaskStatus.COMPLETED


class TestDeleteTask:
	"""Tests for service.delete_task."""

	def test_delete_removes_task(self, db_setup, sample_task):
		"""Deleting a task removes it from the database."""
		user, org, session = db_setup
		task_id = sample_task.id

		service.delete_task(db=session, task=sample_task)

		result = session.query(Task).filter(Task.id == task_id).first()
		assert result is None


# ---------------------------------------------------------------------------
# Route tests
# ---------------------------------------------------------------------------

CREATE_URL = "/api/v1/tickets/{ticket_id}/tasks"
LIST_URL = "/api/v1/tickets/{ticket_id}/tasks"
DETAIL_URL = "/api/v1/tasks/{task_id}"
UPDATE_URL = "/api/v1/tasks/{task_id}"
DELETE_URL = "/api/v1/tasks/{task_id}"


class TestCreateTaskRoute:
	"""Tests for POST /tickets/{ticket_id}/tasks."""

	def test_create_returns_201(self, client, db_setup, sample_ticket):
		"""Successful creation returns 201 with expected fields."""
		user, org, session = db_setup
		response = client.post(
			CREATE_URL.format(ticket_id=sample_ticket.id),
			json={"title": "Implement login"},
		)
		assert response.status_code == 201
		data = response.json()
		assert data["title"] == "Implement login"
		assert data["status"] == "in_progress"
		assert data["description"] is None
		assert data["assignee_id"] is None
		assert data["ticket_id"] == str(sample_ticket.id)
		assert "id" in data
		assert data["created_by"]["id"] == str(user.id)
		assert "name" in data["created_by"]
		assert "avatar_url" in data["created_by"]

	def test_create_with_description(self, client, db_setup, sample_ticket):
		"""Creates a task with description."""
		response = client.post(
			CREATE_URL.format(ticket_id=sample_ticket.id),
			json={"title": "Feature", "description": "Implement the feature"},
		)
		assert response.status_code == 201
		assert response.json()["description"] == "Implement the feature"

	def test_create_with_developer_assignee(self, client, db_setup, sample_ticket, developer_user):
		"""Creates a task assigned to a developer."""
		response = client.post(
			CREATE_URL.format(ticket_id=sample_ticket.id),
			json={"title": "Assigned task", "assignee_id": str(developer_user.id)},
		)
		assert response.status_code == 201
		assert response.json()["assignee_id"] == str(developer_user.id)

	def test_create_with_non_developer_assignee_returns_400(self, client, db_setup, sample_ticket, scrum_master_user):
		"""Returns 400 when assignee does not have Developer role."""
		response = client.post(
			CREATE_URL.format(ticket_id=sample_ticket.id),
			json={"title": "Bad assignment", "assignee_id": str(scrum_master_user.id)},
		)
		assert response.status_code == 400
		assert response.json()["detail"]["error"]["code"] == "INVALID_ASSIGNEE"

	def test_create_ticket_not_found_returns_404(self, client):
		"""Returns 404 when ticket does not exist."""
		response = client.post(
			CREATE_URL.format(ticket_id=uuid4()),
			json={"title": "Orphan task"},
		)
		assert response.status_code == 404
		assert response.json()["detail"]["error"]["code"] == "NOT_FOUND"

	def test_create_empty_title_returns_422(self, client, db_setup, sample_ticket):
		"""Returns 422 when title is empty."""
		response = client.post(
			CREATE_URL.format(ticket_id=sample_ticket.id),
			json={"title": ""},
		)
		assert response.status_code == 422

	def test_create_missing_title_returns_422(self, client, db_setup, sample_ticket):
		"""Returns 422 when title field is missing."""
		response = client.post(
			CREATE_URL.format(ticket_id=sample_ticket.id),
			json={},
		)
		assert response.status_code == 422

	def test_create_title_too_long_returns_422(self, client, db_setup, sample_ticket):
		"""Returns 422 when title exceeds max length."""
		response = client.post(
			CREATE_URL.format(ticket_id=sample_ticket.id),
			json={"title": "x" * (TITLE_MAX_LENGTH + 1)},
		)
		assert response.status_code == 422


class TestListTasksRoute:
	"""Tests for GET /tickets/{ticket_id}/tasks."""

	def test_list_returns_200(self, client, db_setup, sample_ticket):
		"""Returns 200 with an empty list when no tasks exist."""
		response = client.get(LIST_URL.format(ticket_id=sample_ticket.id))
		assert response.status_code == 200
		assert isinstance(response.json(), list)
		assert len(response.json()) == 0

	def test_list_returns_tasks(self, client, db_setup, sample_ticket, sample_task):
		"""Returns the tasks created for the ticket."""
		response = client.get(LIST_URL.format(ticket_id=sample_ticket.id))
		data = response.json()
		assert len(data) == 1
		assert data[0]["id"] == str(sample_task.id)
		assert data[0]["title"] == sample_task.title
		assert data[0]["status"] == "in_progress"

	def test_list_response_has_brief_fields_only(self, client, db_setup, sample_ticket, sample_task):
		"""List endpoint returns only id, title, status (TaskBrief)."""
		response = client.get(LIST_URL.format(ticket_id=sample_ticket.id))
		data = response.json()[0]
		assert set(data.keys()) == {"id", "title", "status"}

	def test_list_filter_in_progress(self, client, db_setup, sample_ticket, sample_task, completed_task):
		"""?status=in_progress returns only in-progress tasks."""
		response = client.get(LIST_URL.format(ticket_id=sample_ticket.id) + "?status=in_progress")
		data = response.json()
		assert all(t["status"] == "in_progress" for t in data)
		ids = [t["id"] for t in data]
		assert str(sample_task.id) in ids
		assert str(completed_task.id) not in ids

	def test_list_filter_completed(self, client, db_setup, sample_ticket, sample_task, completed_task):
		"""?status=completed returns only completed tasks."""
		response = client.get(LIST_URL.format(ticket_id=sample_ticket.id) + "?status=completed")
		data = response.json()
		assert all(t["status"] == "completed" for t in data)
		ids = [t["id"] for t in data]
		assert str(completed_task.id) in ids
		assert str(sample_task.id) not in ids

	def test_list_ticket_not_found_returns_404(self, client):
		"""Returns 404 when ticket does not exist."""
		response = client.get(LIST_URL.format(ticket_id=uuid4()))
		assert response.status_code == 404
		assert response.json()["detail"]["error"]["code"] == "NOT_FOUND"


class TestGetTaskDetailRoute:
	"""Tests for GET /tasks/{task_id}."""

	def test_detail_returns_200(self, client, db_setup, sample_task):
		"""Returns 200 with full task details."""
		response = client.get(DETAIL_URL.format(task_id=sample_task.id))
		assert response.status_code == 200
		data = response.json()
		assert data["id"] == str(sample_task.id)
		assert data["title"] == sample_task.title
		assert data["description"] == sample_task.description
		assert data["status"] == "in_progress"
		assert data["created_by"]["id"] == str(sample_task.created_by)
		assert "name" in data["created_by"]
		assert "avatar_url" in data["created_by"]
		assert data["ticket_id"] == str(sample_task.ticket_id)

	def test_detail_response_has_all_fields(self, client, db_setup, sample_task):
		"""Detail response includes all expected fields."""
		response = client.get(DETAIL_URL.format(task_id=sample_task.id))
		data = response.json()
		expected_keys = {"id", "title", "description", "status", "created_by", "assignee_id", "ticket_id"}
		assert expected_keys == set(data.keys())

	def test_detail_not_found_returns_404(self, client):
		"""Returns 404 when task does not exist."""
		response = client.get(DETAIL_URL.format(task_id=uuid4()))
		assert response.status_code == 404
		assert response.json()["detail"]["error"]["code"] == "NOT_FOUND"


class TestUpdateTaskRoute:
	"""Tests for PATCH /tasks/{task_id}."""

	def test_update_title_returns_200(self, client, db_setup, sample_task):
		"""Successful title update returns 200 with updated content."""
		response = client.patch(
			UPDATE_URL.format(task_id=sample_task.id),
			json={"title": "Updated title"},
		)
		assert response.status_code == 200
		assert response.json()["title"] == "Updated title"

	def test_update_description_returns_200(self, client, db_setup, sample_task):
		"""Successful description update returns 200."""
		response = client.patch(
			UPDATE_URL.format(task_id=sample_task.id),
			json={"description": "New description"},
		)
		assert response.status_code == 200
		assert response.json()["description"] == "New description"

	def test_update_status_to_completed(self, client, db_setup, sample_task):
		"""Can change status to completed."""
		response = client.patch(
			UPDATE_URL.format(task_id=sample_task.id),
			json={"status": "completed"},
		)
		assert response.status_code == 200
		assert response.json()["status"] == "completed"

	def test_update_assignee_to_developer(self, client, db_setup, sample_task, developer_user):
		"""Can assign a developer to the task."""
		response = client.patch(
			UPDATE_URL.format(task_id=sample_task.id),
			json={"assignee_id": str(developer_user.id)},
		)
		assert response.status_code == 200
		assert response.json()["assignee_id"] == str(developer_user.id)

	def test_update_assignee_non_developer_returns_400(self, client, db_setup, sample_task, scrum_master_user):
		"""Returns 400 when assigning a non-developer user."""
		response = client.patch(
			UPDATE_URL.format(task_id=sample_task.id),
			json={"assignee_id": str(scrum_master_user.id)},
		)
		assert response.status_code == 400
		assert response.json()["detail"]["error"]["code"] == "INVALID_ASSIGNEE"

	def test_update_empty_body_changes_nothing(self, client, db_setup, sample_task):
		"""Sending empty body returns task unchanged."""
		original_title = sample_task.title
		response = client.patch(
			UPDATE_URL.format(task_id=sample_task.id),
			json={},
		)
		assert response.status_code == 200
		assert response.json()["title"] == original_title

	def test_update_not_found_returns_404(self, client):
		"""Returns 404 when task does not exist."""
		response = client.patch(
			UPDATE_URL.format(task_id=uuid4()),
			json={"title": "test"},
		)
		assert response.status_code == 404
		assert response.json()["detail"]["error"]["code"] == "NOT_FOUND"

	def test_update_empty_title_returns_422(self, client, db_setup, sample_task):
		"""Returns 422 when title is empty string."""
		response = client.patch(
			UPDATE_URL.format(task_id=sample_task.id),
			json={"title": ""},
		)
		assert response.status_code == 422

	def test_update_null_title_returns_422(self, client, db_setup, sample_task):
		"""Returns 422 when title is explicitly set to null."""
		response = client.patch(
			UPDATE_URL.format(task_id=sample_task.id),
			json={"title": None},
		)
		assert response.status_code == 422

	def test_update_response_has_all_fields(self, client, db_setup, sample_task):
		"""Update response includes all expected fields."""
		response = client.patch(
			UPDATE_URL.format(task_id=sample_task.id),
			json={"title": "Updated"},
		)
		data = response.json()
		expected_keys = {"id", "title", "description", "status", "created_by", "assignee_id", "ticket_id"}
		assert expected_keys == set(data.keys())


class TestDeleteTaskRoute:
	"""Tests for DELETE /tasks/{task_id}."""

	def test_delete_returns_204(self, client, db_setup, sample_task):
		"""Successful deletion returns 204 No Content."""
		response = client.delete(DELETE_URL.format(task_id=sample_task.id))
		assert response.status_code == 204

	def test_delete_removes_task(self, client, db_setup, sample_ticket, sample_task):
		"""After deletion, task no longer appears in list."""
		client.delete(DELETE_URL.format(task_id=sample_task.id))
		response = client.get(LIST_URL.format(ticket_id=sample_ticket.id))
		assert len(response.json()) == 0

	def test_delete_not_found_returns_404(self, client):
		"""Returns 404 when task does not exist."""
		response = client.delete(DELETE_URL.format(task_id=uuid4()))
		assert response.status_code == 404
		assert response.json()["detail"]["error"]["code"] == "NOT_FOUND"

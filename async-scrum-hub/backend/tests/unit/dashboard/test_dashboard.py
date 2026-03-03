"""
Unit tests for the dashboard module (schemas, service, routes).

Tests cover:
- Schema validation (DashboardSummary, RecentUpdateItem, DashboardResponse)
- Service business logic (get_dashboard)
- Route endpoint via TestClient (GET /organizations/{org_id}/dashboard)

To run:
    docker-compose exec backend pytest tests/unit/dashboard/ -v --tb=long
"""

import pytest
from uuid import uuid4
from datetime import datetime, timedelta, timezone
from sqlalchemy import text

from src.dashboard.schemas import DashboardSummary, RecentUpdateItem, DashboardResponse
from src.dashboard import service
from src.database.models import Task, Ticket, Blocker
from src.database.models.enums import TaskStatus, TicketStatus, BlockerStatus, Priority


DASHBOARD_URL = "/organizations/{org_id}/dashboard"


# ---------------------------------------------------------------------------
# Schema tests
# ---------------------------------------------------------------------------

class TestDashboardSchemas:

	def test_dashboard_summary(self):
		summary = DashboardSummary(tasks_in_progress=3, tickets_completed=5, active_blockers=1)
		assert summary.tasks_in_progress == 3
		assert summary.tickets_completed == 5
		assert summary.active_blockers == 1

	def test_recent_update_item_created(self):
		now = datetime.now(timezone.utc)
		item = RecentUpdateItem(type="task", event="created", title="My Task", timestamp=now)
		assert item.type == "task"
		assert item.event == "created"
		assert item.title == "My Task"
		assert item.timestamp == now

	def test_recent_update_item_completed(self):
		now = datetime.now(timezone.utc)
		item = RecentUpdateItem(type="ticket", event="completed", title="My Ticket", timestamp=now)
		assert item.type == "ticket"
		assert item.event == "completed"

	def test_dashboard_response(self):
		summary = DashboardSummary(tasks_in_progress=0, tickets_completed=0, active_blockers=0)
		response = DashboardResponse(summary=summary, recent_updates=[])
		assert response.summary == summary
		assert response.recent_updates == []


# ---------------------------------------------------------------------------
# Service tests
# ---------------------------------------------------------------------------

class TestGetDashboardService:

	def test_raises_403_when_wrong_org(self, db_setup):
		"""User belonging to a different org than the one requested gets 403."""
		from fastapi import HTTPException
		user, session, org_id = db_setup
		with pytest.raises(HTTPException) as exc_info:
			service.get_dashboard(session, user, uuid4())
		assert exc_info.value.status_code == 403

	def test_raises_403_when_no_organization(self, db_setup_no_org):
		"""User without org gets 403."""
		from fastapi import HTTPException
		user, session = db_setup_no_org
		with pytest.raises(HTTPException) as exc_info:
			service.get_dashboard(session, user, uuid4())
		assert exc_info.value.status_code == 403

	def test_returns_dashboard_response(self, db_setup):
		"""Returns DashboardResponse for a user with matching org."""
		user, session, org_id = db_setup
		result = service.get_dashboard(session, user, org_id)
		assert isinstance(result, DashboardResponse)

	def test_summary_tasks_in_progress_zero_when_empty(self, db_setup):
		"""tasks_in_progress is 0 when no tasks exist."""
		user, session, org_id = db_setup
		result = service.get_dashboard(session, user, org_id)
		assert result.summary.tasks_in_progress == 0

	def test_summary_counts_in_progress_tasks(self, db_setup):
		"""tasks_in_progress counts IN_PROGRESS tasks in the org."""
		user, session, org_id = db_setup
		for _ in range(3):
			session.add(Task(
				id=uuid4(),
				title="Task",
				organization_id=org_id,
				created_by=user.id,
				ticket_id=uuid4(),
				status=TaskStatus.IN_PROGRESS,
			))
		session.commit()
		result = service.get_dashboard(session, user, org_id)
		assert result.summary.tasks_in_progress == 3

	def test_summary_counts_completed_tickets(self, db_setup):
		"""tickets_completed counts COMPLETED tickets in the org."""
		user, session, org_id = db_setup
		for _ in range(2):
			session.add(Ticket(
				id=uuid4(),
				title="Ticket",
				organization_id=org_id,
				created_by=user.id,
				status=TicketStatus.COMPLETED,
				priority=Priority.MEDIUM,
			))
		session.commit()
		result = service.get_dashboard(session, user, org_id)
		assert result.summary.tickets_completed == 2

	def test_summary_counts_open_blockers(self, db_setup):
		"""active_blockers counts OPEN blockers in the org."""
		user, session, org_id = db_setup
		session.add(Blocker(
			id=uuid4(),
			description="Blocked",
			organization_id=org_id,
			created_by=user.id,
			status=BlockerStatus.OPEN,
		))
		session.commit()
		result = service.get_dashboard(session, user, org_id)
		assert result.summary.active_blockers == 1

	def test_recent_updates_is_list(self, db_setup):
		"""recent_updates is a list."""
		user, session, org_id = db_setup
		result = service.get_dashboard(session, user, org_id)
		assert isinstance(result.recent_updates, list)

	def test_recent_updates_empty_when_no_data(self, db_setup):
		"""recent_updates is empty when no tasks or tickets exist."""
		user, session, org_id = db_setup
		result = service.get_dashboard(session, user, org_id)
		assert result.recent_updates == []

	def test_recent_updates_includes_in_progress_tasks(self, db_setup):
		"""IN_PROGRESS tasks created this week appear in recent_updates as 'created'."""
		user, session, org_id = db_setup
		session.add(Task(
			id=uuid4(),
			title="Recent Task",
			organization_id=org_id,
			created_by=user.id,
			ticket_id=uuid4(),
			status=TaskStatus.IN_PROGRESS,
		))
		session.commit()
		result = service.get_dashboard(session, user, org_id)
		events = [(i.type, i.event) for i in result.recent_updates]
		assert ("task", "created") in events

	def test_recent_updates_includes_completed_tickets(self, db_setup):
		"""COMPLETED tickets updated this week appear in recent_updates as 'completed'."""
		user, session, org_id = db_setup
		session.add(Ticket(
			id=uuid4(),
			title="Done Ticket",
			organization_id=org_id,
			created_by=user.id,
			status=TicketStatus.COMPLETED,
			priority=Priority.MEDIUM,
		))
		session.commit()
		result = service.get_dashboard(session, user, org_id)
		events = [(i.type, i.event) for i in result.recent_updates]
		assert ("ticket", "completed") in events

	def test_recent_updates_max_6_items(self, db_setup):
		"""recent_updates returns at most 6 items even when more exist."""
		user, session, org_id = db_setup
		for i in range(8):
			session.add(Task(
				id=uuid4(),
				title=f"Task {i}",
				organization_id=org_id,
				created_by=user.id,
				ticket_id=uuid4(),
				status=TaskStatus.IN_PROGRESS,
			))
		session.commit()
		result = service.get_dashboard(session, user, org_id)
		assert len(result.recent_updates) <= 6

	def test_recent_updates_ordered_most_recent_first(self, db_setup):
		"""recent_updates is ordered by timestamp descending."""
		user, session, org_id = db_setup
		now = datetime.now(timezone.utc)
		for days_ago in [5, 3, 1]:
			ts = (now - timedelta(days=days_ago)).strftime("%Y-%m-%d %H:%M:%S")
			session.execute(text("""
				INSERT INTO tasks (id, organization_id, created_by, ticket_id, title, status, created_at, updated_at)
				VALUES (:id, :org_id, :user_id, :ticket_id, 'Task', 'in_progress', :ts, :ts)
			"""), {
				"id": str(uuid4()),
				"org_id": str(org_id),
				"user_id": str(user.id),
				"ticket_id": str(uuid4()),
				"ts": ts,
			})
		session.commit()
		result = service.get_dashboard(session, user, org_id)
		items = result.recent_updates
		for i in range(len(items) - 1):
			assert items[i].timestamp >= items[i + 1].timestamp


# ---------------------------------------------------------------------------
# Route tests
# ---------------------------------------------------------------------------

class TestDashboardRoute:

	def test_returns_200_for_org_member(self, client, db_setup):
		"""Returns 200 OK for authenticated org member."""
		user, session, org_id = db_setup
		response = client.get(DASHBOARD_URL.format(org_id=org_id))
		assert response.status_code == 200

	def test_response_has_summary_and_recent_updates(self, client, db_setup):
		"""Response contains summary and recent_updates fields."""
		user, session, org_id = db_setup
		data = client.get(DASHBOARD_URL.format(org_id=org_id)).json()
		assert "summary" in data
		assert "recent_updates" in data

	def test_summary_has_all_fields(self, client, db_setup):
		"""summary contains tasks_in_progress, tickets_completed, active_blockers."""
		user, session, org_id = db_setup
		data = client.get(DASHBOARD_URL.format(org_id=org_id)).json()
		assert "tasks_in_progress" in data["summary"]
		assert "tickets_completed" in data["summary"]
		assert "active_blockers" in data["summary"]

	def test_returns_404_when_org_not_found(self, client):
		"""Returns 404 when the org_id does not exist in the database."""
		response = client.get(DASHBOARD_URL.format(org_id=uuid4()))
		assert response.status_code == 404
		assert response.json()["detail"]["error"]["code"] == "NOT_FOUND"

	def test_returns_403_when_user_in_different_org(self, client_different_org, db_setup_different_org):
		"""Returns 403 when the user belongs to a different org than requested."""
		user, session, org_id = db_setup_different_org
		response = client_different_org.get(DASHBOARD_URL.format(org_id=org_id))
		assert response.status_code == 403

	def test_recent_updates_is_list(self, client, db_setup):
		"""recent_updates in response is a list."""
		user, session, org_id = db_setup
		data = client.get(DASHBOARD_URL.format(org_id=org_id)).json()
		assert isinstance(data["recent_updates"], list)

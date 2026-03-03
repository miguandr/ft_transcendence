"""
Unit tests for the analytics module (schemas, service, routes).

Tests cover:
- Schema validation (TaskWeekData, TicketWeekData, StandupParticipation, AnalyticsResponse)
- Service business logic (get_analytics)
- Route endpoint via TestClient (GET /organizations/{org_id}/analytics)

To run:
    docker-compose exec backend pytest tests/unit/analytics/ -v --tb=long
"""

import pytest
from uuid import uuid4
from datetime import date
from sqlalchemy import text

from src.analytics.schemas import (
	TaskWeekData,
	TicketWeekData,
	StandupParticipation,
	AnalyticsResponse,
)
from src.analytics import service


ANALYTICS_URL = "/organizations/{org_id}/analytics"


# ---------------------------------------------------------------------------
# Schema tests
# ---------------------------------------------------------------------------

class TestAnalyticsSchemas:

	def test_task_week_data(self):
		data = TaskWeekData(week="Week 1", in_progress=3, completed=5)
		assert data.week == "Week 1"
		assert data.in_progress == 3
		assert data.completed == 5

	def test_ticket_week_data(self):
		data = TicketWeekData(week="Week 2", completed=7)
		assert data.week == "Week 2"
		assert data.completed == 7

	def test_standup_participation(self):
		data = StandupParticipation(posted=3, total=4)
		assert data.posted == 3
		assert data.total == 4

	def test_analytics_response(self):
		response = AnalyticsResponse(
			tasks=[TaskWeekData(week="Week 1", in_progress=1, completed=2)],
			tickets=[TicketWeekData(week="Week 1", completed=3)],
			standups=StandupParticipation(posted=2, total=4),
			blockers_avg_cycle_time=10.5,
		)
		assert len(response.tasks) == 1
		assert len(response.tickets) == 1
		assert response.standups.posted == 2
		assert response.blockers_avg_cycle_time == 10.5


# ---------------------------------------------------------------------------
# Service tests
# ---------------------------------------------------------------------------

class TestGetAnalyticsService:

	def test_raises_403_when_no_organization(self, db_setup_no_org):
		"""User without org gets 403."""
		from fastapi import HTTPException
		user, session = db_setup_no_org
		with pytest.raises(HTTPException) as exc_info:
			service.get_analytics(session, user)
		assert exc_info.value.status_code == 403
		assert exc_info.value.detail["error"]["code"] == "NO_ORGANIZATION"

	def test_returns_analytics_response(self, db_setup):
		"""Returns AnalyticsResponse for a user with org."""
		user, session, org_id = db_setup
		result = service.get_analytics(session, user)
		assert isinstance(result, AnalyticsResponse)

	def test_tasks_has_4_weeks(self, db_setup):
		"""tasks always returns exactly 4 weeks."""
		user, session, org_id = db_setup
		result = service.get_analytics(session, user)
		assert len(result.tasks) == 4

	def test_tasks_weeks_labeled_correctly(self, db_setup):
		"""tasks weeks are labeled Week 1 through Week 4."""
		user, session, org_id = db_setup
		result = service.get_analytics(session, user)
		labels = [w.week for w in result.tasks]
		assert labels == ["Week 1", "Week 2", "Week 3", "Week 4"]

	def test_tickets_has_4_weeks(self, db_setup):
		"""tickets always returns exactly 4 weeks."""
		user, session, org_id = db_setup
		result = service.get_analytics(session, user)
		assert len(result.tickets) == 4

	def test_standup_total_counts_org_members(self, db_setup):
		"""standups.total equals number of users in the org."""
		user, session, org_id = db_setup
		result = service.get_analytics(session, user)
		assert result.standups.total == 1

	def test_standup_posted_zero_with_no_standups(self, db_setup):
		"""standups.posted is 0 when no standups exist today."""
		user, session, org_id = db_setup
		result = service.get_analytics(session, user)
		assert result.standups.posted == 0

	def test_standup_posted_counts_todays_standups(self, db_setup):
		"""standups.posted reflects standups submitted today."""
		user, session, org_id = db_setup
		session.execute(text("""
			INSERT INTO standups (id, organization_id, created_by, today, standup_date)
			VALUES (:id, :org_id, :user_id, 'Working on feature', :today)
		"""), {
			"id": uuid4().hex,
			"org_id": org_id.hex,
			"user_id": user.id.hex,
			"today": str(date.today()),
		})
		session.commit()
		result = service.get_analytics(session, user)
		assert result.standups.posted == 1

	def test_active_task_counted_in_current_week(self, db_setup):
		"""IN_PROGRESS task created this week appears in Week 4 active count."""
		user, session, org_id = db_setup
		session.execute(text("""
			INSERT INTO tasks (id, organization_id, created_by, ticket_id, title, status)
			VALUES (:id, :org_id, :user_id, :ticket_id, 'Task A', 'IN_PROGRESS')
		"""), {
			"id": uuid4().hex,
			"org_id": org_id.hex,
			"user_id": user.id.hex,
			"ticket_id": uuid4().hex,
		})
		session.commit()
		result = service.get_analytics(session, user)
		week4 = next(w for w in result.tasks if w.week == "Week 4")
		assert week4.in_progress == 1

	def test_resolved_task_counted_in_current_week(self, db_setup):
		"""COMPLETED task updated this week appears in Week 4 resolved count."""
		user, session, org_id = db_setup
		session.execute(text("""
			INSERT INTO tasks (id, organization_id, created_by, ticket_id, title, status)
			VALUES (:id, :org_id, :user_id, :ticket_id, 'Task B', 'COMPLETED')
		"""), {
			"id": uuid4().hex,
			"org_id": org_id.hex,
			"user_id": user.id.hex,
			"ticket_id": uuid4().hex,
		})
		session.commit()
		result = service.get_analytics(session, user)
		week4 = next(w for w in result.tasks if w.week == "Week 4")
		assert week4.completed == 1

	def test_completed_ticket_counted_in_current_week(self, db_setup):
		"""COMPLETED ticket created this week appears in Week 4 completed count."""
		user, session, org_id = db_setup
		session.execute(text("""
			INSERT INTO tickets (id, organization_id, created_by, title, status, priority)
			VALUES (:id, :org_id, :user_id, 'Ticket A', 'COMPLETED', 'medium')
		"""), {
			"id": uuid4().hex,
			"org_id": org_id.hex,
			"user_id": user.id.hex,
		})
		session.commit()
		result = service.get_analytics(session, user)
		week4 = next(w for w in result.tickets if w.week == "Week 4")
		assert week4.completed == 1

	def test_avg_cycle_time_zero_when_no_resolved_blockers(self, db_setup):
		"""blockers_avg_cycle_time is 0.0 when no resolved blockers exist."""
		user, session, org_id = db_setup
		result = service.get_analytics(session, user)
		assert result.blockers_avg_cycle_time == 0.0


# ---------------------------------------------------------------------------
# Route tests
# ---------------------------------------------------------------------------

class TestAnalyticsRoute:

	def test_returns_200_for_org_member(self, client, db_setup):
		"""Returns 200 OK for authenticated org member."""
		user, session, org_id = db_setup
		response = client.get(ANALYTICS_URL.format(org_id=org_id))
		assert response.status_code == 200

	def test_response_has_all_fields(self, client, db_setup):
		"""Response contains tasks, tickets, standups, blockers_avg_cycle_time."""
		user, session, org_id = db_setup
		data = client.get(ANALYTICS_URL.format(org_id=org_id)).json()
		assert "tasks" in data
		assert "tickets" in data
		assert "standups" in data
		assert "blockers_avg_cycle_time" in data

	def test_standups_has_posted_and_total(self, client, db_setup):
		"""standups field contains posted and total."""
		user, session, org_id = db_setup
		data = client.get(ANALYTICS_URL.format(org_id=org_id)).json()
		assert "posted" in data["standups"]
		assert "total" in data["standups"]

	def test_returns_403_when_no_organization(self, client_no_org, db_setup_no_org):
		"""Returns 403 when user has no organization."""
		user, session = db_setup_no_org
		response = client_no_org.get(ANALYTICS_URL.format(org_id=uuid4()))
		assert response.status_code == 403
		assert response.json()["detail"]["error"]["code"] == "NO_ORGANIZATION"

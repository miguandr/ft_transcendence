from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from datetime import datetime, timedelta, timezone, date
from src.database.models import Task, Ticket, Standup, User
from src.database.models.enums import TaskStatus, TicketStatus
from src.analytics.schemas import TaskWeekData, TicketWeekData, StandupParticipation

from src.config.security import hash_password, verify_password, create_access_token

from src.analytics.schemas import AnalyticsResponse


def get_analytics(db: Session, user: User) -> AnalyticsResponse:
	if user.organization_id is None:
		raise HTTPException(
			status_code=status.HTTP_403_FORBIDDEN,
			detail={"error": {"code": "NO_ORGANIZATION", "message": "User is not part of any organization."}},
		)
	
	# --- tasks (line chart) ---
	now = datetime.now(timezone.utc)
	tasks_data = []
	#week 1, 2, 3, 4
	for i in range(3, -1, -1):
		week_end = now - timedelta(weeks=i)
		week_start = week_end - timedelta(weeks=1)
		label = f"Week {4 - i}"

		active = db.query(Task).filter(
			Task.organization_id == user.organization_id,
			Task.status == TaskStatus.IN_PROGRESS,
			Task.created_at >= week_start,
			Task.created_at < week_end,
		).count()

		resolved = db.query(Task).filter(
			Task.organization_id == user.organization_id,
			Task.status == TaskStatus.COMPLETED,
			Task.updated_at >= week_start,
			Task.updated_at < week_end,
		).count()

		tasks_data.append(TaskWeekData(week=label, active=active, resolved=resolved))
		
	# --- tickets (bar chart) ---
	now = datetime.now(timezone.utc)
	tickets_data = []
	for i in range(3, -1, -1):
		week_end = now - timedelta(weeks=i)
		week_start = week_end - timedelta(weeks=1)
		label = f"Week {4 - i}"

		completed = db.query(Ticket).filter(
			Ticket.organization_id == user.organization_id,
			Ticket.status == TicketStatus.COMPLETED,
			Ticket.created_at >= week_start,
			Ticket.created_at < week_end,
		).count()

		tickets_data.append(TicketWeekData(week=label, completed=completed))

	# --- Standups (numeric card) ---
	today = date.today()
	total = db.query(User).filter(User.organization_id == user.organization_id).count()
	posted = db.query(Standup).filter(
		Standup.organization_id == user.organization_id,
		Standup.standup_date == today
	).count()

	standp_data = StandupParticipation(posted=posted, total=total) 

	# --- Blockers (numeric card) ---


	return AnalyticsResponse(
		tasks=tasks_data, 
		tickets=tickets_data,
		standups=standp_data,
		blockers_avg_cycle_time=
	)
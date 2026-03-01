import uuid
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from src.database.models import User, Task, Ticket
from src.database.models.enums import TaskStatus

#HTTP exceptions 

#def Unproscessable_entity_exception(error_type: str) -> HTTPException:

def bad_request_exception() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail={"error": {"code": "INVALID_ASSIGNEE", "message": "Only users with Developer role can be assigned to tasks"}},
    )

def Unauthorized_exception() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail={"error": {"code": "UNAUTHORIZED", "message": "Authentication required"}},
    )

def not_found_exception(message: str = "Not found") -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail={"error": {"code": "NOT_FOUND", "message": message}},
    )

def forbidden_exception() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail={"error": {"code": "FORBIDDEN", "message": "You do not have permission to perform this action"}},
    )



def validate_assignee(db: Session, assignee_id: uuid.UUID | None, organization_id: uuid.UUID) -> None:
    """Validate that the assignee exists and has the Developer role."""
    if assignee_id is None:
        return
    assignee = db.query(User).filter(User.id == assignee_id).first()
    if not assignee:
        raise not_found_exception("Assignee not found")
    if assignee.organization_id != organization_id:
        raise forbidden_exception()
    if assignee.scrum_role != "developer":
        raise bad_request_exception()


def get_ticket(db: Session, ticket_id: uuid.UUID) -> Ticket:
	"""Load ticket from DB or raise 404."""
	ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
	if not ticket:
		raise not_found_exception("Ticket not found")
	return ticket


def create_task(
	db: Session,
	current_user: User,
	ticket_id: uuid.UUID,
	title: str,
	description: str | None,
	assignee_id: uuid.UUID | None,
) -> Task:
	# 1. Load ticket (404 if not found)
	ticket = get_ticket(db, ticket_id)

	# 2. Check user is part of the organization
	if current_user.organization_id != ticket.organization_id:
		raise forbidden_exception()

	# 3. Validate assignee has Developer role (400 if not)
	validate_assignee(db, assignee_id, current_user.organization_id)

	# 4. Create task — status defaults to IN_PROGRESS, creator = current user
	task = Task(
		title=title,
		description=description,
		status=TaskStatus.IN_PROGRESS,
		created_by=current_user.id,
		assignee_id=assignee_id,
		ticket_id=ticket.id,
		organization_id=ticket.organization_id,
	)
	db.add(task)
	db.commit()
	db.refresh(task)
	return task

def list_tasks(
	db: Session,
	current_user: User,
	ticket_id: uuid.UUID,
	status_filter: str | None,
) -> list[Task]:
	# 1. Load ticket (404 if not found)
	ticket = get_ticket(db, ticket_id)

	# 2. Check user is part of the organization
	if current_user.organization_id != ticket.organization_id:
		raise forbidden_exception()

	# 3. Query tasks for this ticket, optionally filtered by status
	query = db.query(Task).filter(Task.ticket_id == ticket_id)
	if status_filter == "in_progress":
		query = query.filter(Task.status == TaskStatus.IN_PROGRESS)
	elif status_filter == "completed":
		query = query.filter(Task.status == TaskStatus.COMPLETED)
	return query.all()


def get_task(
	db: Session,
	current_user: User,
	task_id: uuid.UUID,
) -> Task:
	# 1. Load task (404 if not found)
	task = db.query(Task).filter(Task.id == task_id).first()
	if not task:
		raise not_found_exception("Task not found")

	# 2. Check user is part of the organization
	if current_user.organization_id != task.organization_id:
		raise forbidden_exception()

	return task

#TODO CHECK THIS FUNCTION and DO DEL TASK FUNCTION

def update_task(
	db: Session,
	current_user: User,
	task_id: uuid.UUID,
	updates: dict,
) -> Task:
	# 1. Load task (404 if not found)
	task = db.query(Task).filter(Task.id == task_id).first()
	if not task:
		raise not_found_exception("Task not found")

	# 2. Check user is part of the organization
	if current_user.organization_id != task.organization_id:
		raise forbidden_exception()

	# 3. Permission: SM, PO, or Developer who is owner/assignee
	user_role = current_user.scrum_role
	if user_role == "developer":
		if task.created_by != current_user.id and task.assignee_id != current_user.id:
			raise forbidden_exception()
	elif user_role not in ("scrum_master", "product_owner"):
		raise forbidden_exception()

	# 4. Validate assignee if provided
	if "assignee_id" in updates:
		validate_assignee(db, updates["assignee_id"], task.organization_id)

	# 5. Apply only the fields that were explicitly sent
	for field, value in updates.items():
		setattr(task, field, value)

	db.commit()
	db.refresh(task)
	return task
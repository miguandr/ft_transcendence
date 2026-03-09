"""
Tasks API routes.

AUTHORIZATION DEPENDENCIES (from src.api.deps):
- require_org_member: For list endpoints where any member can access
- require_org_permission(action): For endpoints with org_id in path
- require_resource_permission(action, loader): For endpoints with task_id in path

LOADER REQUIREMENT:
For require_resource_permission, you must create a loader function in this module's deps.py.
The loader MUST have these parameters:
    - task_id: uuid.UUID  (extracted from path by FastAPI)
    - db: Session = Depends(get_db)  (database session)
The loader MUST return the Task object or raise HTTPException(404) if not found.

Example loader signature:
    def get_task(task_id: uuid.UUID, db: Session = Depends(get_db)) -> Task:
        task = db.query(Task).filter(Task.id == task_id).first()
        if not task:
            raise HTTPException(404, "Task not found")
        return task
"""

import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from src.database import get_db
from src.database.models import User
from src.database.models.task import Task
from src.database.models.ticket import Ticket
from src.database.models.enums import TaskStatus
from src.api.deps import get_current_user, require_resource_permission
from src.tasks import service
from src.schemas.common import UserBrief
from src.tasks.schemas import (
	CreateTaskRequest,
	CreateTaskResponse,
	TaskBrief,
	TaskDetailResponse,
	UpdateTaskRequest,
	UpdateTaskResponse,
)

router = APIRouter()


def get_ticket_loader(ticket_id: uuid.UUID, db: Session = Depends(get_db)) -> Ticket:
	ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
	if not ticket:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail={"error": {"code": "NOT_FOUND", "message": "Ticket not found"}},
		)
	return ticket


def get_task_loader(task_id: uuid.UUID, db: Session = Depends(get_db)) -> Task:
	task = db.query(Task).filter(Task.id == task_id).first()
	if not task:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail={"error": {"code": "NOT_FOUND", "message": "Task not found"}},
		)
	return task


@router.post(
	"/tickets/{ticket_id}/tasks",
	response_model=CreateTaskResponse,
	status_code=status.HTTP_201_CREATED,
)
def create_task(
	body: CreateTaskRequest,
	db: Session = Depends(get_db),
	ticket: Ticket = Depends(require_resource_permission("tickets:tasks:create", get_ticket_loader)),
	current_user: User = Depends(get_current_user),
):
	task = service.create_task(
		db=db,
		current_user=current_user,
		ticket=ticket,
		title=body.title,
		description=body.description,
		assignee_id=body.assignee_id,
	)
	return CreateTaskResponse(
		id=task.id,
		title=task.title,
		description=task.description,
		status=task.status,
		created_by=UserBrief.model_validate(task.creator),
		assignee_id=task.assignee_id,
		ticket_id=task.ticket_id,
	)


@router.get(
	"/tickets/{ticket_id}/tasks",
	response_model=list[TaskBrief],
	status_code=status.HTTP_200_OK,
)
def list_tasks(
	status_filter: Optional[TaskStatus] = Query(None, alias="status"),
	db: Session = Depends(get_db),
	ticket: Ticket = Depends(require_resource_permission("tickets:tasks:list", get_ticket_loader)),
):
	tasks = service.list_tasks(
		db=db,
		ticket=ticket,
		status_filter=status_filter,
	)
	return [
		TaskBrief(id=t.id, title=t.title, status=t.status)
		for t in tasks
	]


@router.get(
	"/tasks/{task_id}",
	response_model=TaskDetailResponse,
	status_code=status.HTTP_200_OK,
)
def get_task_detail(
	task: Task = Depends(require_resource_permission("tasks:details", get_task_loader)),
):
	return TaskDetailResponse(
		id=task.id,
		title=task.title,
		description=task.description,
		status=task.status,
		created_by=UserBrief.model_validate(task.creator),
		assignee_id=task.assignee_id,
		ticket_id=task.ticket_id,
	)


@router.patch(
	"/tasks/{task_id}",
	response_model=UpdateTaskResponse,
	status_code=status.HTTP_200_OK,
)
def update_task(
	body: UpdateTaskRequest,
	db: Session = Depends(get_db),
	task: Task = Depends(require_resource_permission("tasks:update", get_task_loader)),
):
	updates = body.model_dump(exclude_unset=True)
	updated_task = service.update_task(
		db=db,
		task=task,
		updates=updates,
	)
	return UpdateTaskResponse(
		id=updated_task.id,
		title=updated_task.title,
		description=updated_task.description,
		status=updated_task.status,
		created_by=UserBrief.model_validate(updated_task.creator),
		assignee_id=updated_task.assignee_id,
		ticket_id=updated_task.ticket_id,
	)


@router.delete(
	"/tasks/{task_id}",
	status_code=status.HTTP_204_NO_CONTENT,
)
def delete_task(
	db: Session = Depends(get_db),
	task: Task = Depends(require_resource_permission("tasks:delete", get_task_loader)),
):
	service.delete_task(db=db, task=task)

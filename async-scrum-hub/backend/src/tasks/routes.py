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
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from src.database import get_db
from src.database.models import User
from src.api.deps import get_current_user
from src.tasks import service
from src.tasks.schemas import (
	CreateTaskRequest,
	CreateTaskResponse,
	TaskBrief,
	TaskDetailResponse,
	UpdateTaskRequest,
	UpdateTaskResponse,
)

router = APIRouter()


@router.post(
	"/tickets/{ticket_id}/tasks",
	response_model=CreateTaskResponse,
	status_code=status.HTTP_201_CREATED,
)
def create_task(
	ticket_id: uuid.UUID,
	body: CreateTaskRequest,
	db: Session = Depends(get_db),
	current_user: User = Depends(get_current_user),
):
	task = service.create_task(
		db=db,
		current_user=current_user,
		ticket_id=ticket_id,
		title=body.title,
		description=body.description,
		assignee_id=body.assignee_id,
	)
	return CreateTaskResponse(
		id=task.id,
		title=task.title,
		description=task.description,
		status=task.status,
		created_by=task.created_by,
		assignee_id=task.assignee_id,
		ticket_id=task.ticket_id,
	)


@router.get(
	"/tickets/{ticket_id}/tasks",
	response_model=list[TaskBrief],
	status_code=status.HTTP_200_OK,
)
def list_tasks(
	ticket_id: uuid.UUID,
	status_filter: Optional[str] = Query(None, alias="status"),
	db: Session = Depends(get_db),
	current_user: User = Depends(get_current_user),
):
	tasks = service.list_tasks(
		db=db,
		current_user=current_user,
		ticket_id=ticket_id,
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
def get_task(
	task_id: uuid.UUID,
	db: Session = Depends(get_db),
	current_user: User = Depends(get_current_user),
):
	task = service.get_task(db=db, current_user=current_user, task_id=task_id)
	return TaskDetailResponse(
		id=task.id,
		title=task.title,
		description=task.description,
		status=task.status,
		created_by=task.created_by,
		assignee_id=task.assignee_id,
		ticket_id=task.ticket_id,
	)


@router.patch(
	"/tasks/{task_id}",
	response_model=UpdateTaskResponse,
	status_code=status.HTTP_200_OK,
)
def update_task(
	task_id: uuid.UUID,
	body: UpdateTaskRequest,
	db: Session = Depends(get_db),
	current_user: User = Depends(get_current_user),
):
	# Only send fields that were explicitly provided (exclude unset)
	updates = body.model_dump(exclude_unset=True)
	task = service.update_task(
		db=db,
		current_user=current_user,
		task_id=task_id,
		updates=updates,
	)
	return UpdateTaskResponse(
		id=task.id,
		title=task.title,
		description=task.description,
		status=task.status,
		created_by=task.created_by,
		assignee_id=task.assignee_id,
		ticket_id=task.ticket_id,
	)

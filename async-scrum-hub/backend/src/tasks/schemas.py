from uuid import UUID
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from src.database.models.enums import TaskStatus



class CreateTaskRequest(BaseModel):
    title: str = Field(..., min_length=1)
    description: Optional[str] = None
    assignee_id: Optional[UUID] = None

class CreateTaskResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str]
    status: TaskStatus
    created_by: UUID
    assignee_id: Optional[UUID]
    ticket_id: UUID
    
    model_config = ConfigDict(from_attributes=True)


class TaskBrief(BaseModel):
	id: UUID
	title: str
	status: TaskStatus

	model_config = ConfigDict(from_attributes=True)
     
#class ListTasksResponse(BaseModel):
#    tasks: list[TaskBrief]
     
class TaskBriefOrg(TaskBrief):
	ticket_id: UUID
      
class TaskDetailResponse(CreateTaskResponse):
    pass

class UpdateTaskRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=1)
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    assignee_id: Optional[UUID] = None

class UpdateTaskResponse(CreateTaskResponse):
    pass
from uuid import UUID
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from src.database.models.enums import TicketStatus, Priority
from src.users.schemas import UserBriefTicket
from src.schemas.common import UserBrief

class TicketBriefOrg(BaseModel):
	id: UUID
	title: str
	status: TicketStatus
	priority: Priority

	model_config = ConfigDict(from_attributes=True)


class TicketBriefList(TicketBriefOrg):
	assignee: Optional[UserBriefTicket] = None
	created_at: datetime
	updated_at: datetime


class CreateTicketRequest(BaseModel):
	title: str = Field(..., min_length=1)
	description: Optional[str] = None
	priority: Priority
	assignee_id: Optional[UUID] = None

class CreateTicketResponse(BaseModel):
	id: UUID
	title: str
	description: Optional[str]
	status: TicketStatus
	priority: Priority
	created_by: UserBrief
	assignee_id: Optional[UUID]
	organization_id: UUID
	created_at: datetime
	updated_at: datetime

	model_config = ConfigDict(from_attributes=True)

#class ListTicketsResponse(BaseModel):
#    tickets: list[TicketBriefList]

class TicketDetailResponse(CreateTicketResponse):
	pass

class UpdateTicketRequest(BaseModel):
	title: Optional[str] = Field(None, min_length=1)
	description: Optional[str] = None
	priority: Optional[Priority] = None
	status: Optional[TicketStatus] = None
	assignee_id: Optional[UUID] = None

class UpdateTicketResponse(CreateTicketResponse):
	pass


class MoveTicketRequest(BaseModel):
	status: TicketStatus

class MoveTicketResponse(BaseModel):
	id: UUID
	status: TicketStatus
	updated_at: datetime

	model_config = ConfigDict(from_attributes=True)

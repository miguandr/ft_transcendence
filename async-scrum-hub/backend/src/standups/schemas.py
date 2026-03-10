from uuid import UUID
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field

from src.schemas.common import UserBrief


class StandupCreateRequest(BaseModel):
	today: str = Field(..., min_length=1)


class StandupUpdateRequest(BaseModel):
	today: Optional[str] = Field(None, min_length=1)


class TicketBrief(BaseModel):
	id: UUID
	title: str

	model_config = ConfigDict(from_attributes=True)


# NOTE: API contract names this field "title" but the Blocker model uses "description".
# Using "description" here to match the model. If the contract needs "title",
# the Blocker model should be updated to add a title field.
class BlockerBriefInStandup(BaseModel):
	id: UUID
	description: str
	ticket: Optional[TicketBrief] = None

	model_config = ConfigDict(from_attributes=True)


class StandupCreateResponse(BaseModel):
	id: UUID
	created_at: datetime
	today: str
	yesterday: Optional[str]
	blocker_ids: Optional[list[UUID]]
	created_by: UserBrief

	model_config = ConfigDict(from_attributes=True)


class StandupResponse(BaseModel):
	id: UUID
	created_at: datetime
	today: str
	yesterday: Optional[str]
	blockers: list[BlockerBriefInStandup]
	created_by: UserBrief

	model_config = ConfigDict(from_attributes=True)

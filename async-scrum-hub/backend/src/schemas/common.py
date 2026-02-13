# Shared Pydantic schemas used across multiple endpoints.
#
# UserBrief: Lightweight user representation (id, name, avatar_url).
# Use it whenever an endpoint needs to return user info without exposing
# the full User model (e.g. assigned_to, created_by fields).
#
# Usage example in an endpoint:
#
#   from src.schemas.common import UserBrief
#
#   @router.post("/tickets")
#   async def create_ticket(...):
#       # ... create ticket in DB ...
#       return {
#           "id": ticket.id,
#           "title": ticket.title,
#           "assigned_to": UserBrief.model_validate(ticket.assigned_to),
#           "created_by": UserBrief.model_validate(ticket.created_by),
#       }

from uuid import UUID
from pydantic import BaseModel, ConfigDict


class UserBrief(BaseModel):
	id: UUID
	name: str
	avatar_url: str | None

	model_config = ConfigDict(from_attributes=True)

from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict

class UpdateUserRequest(BaseModel):
	name: str = Field(..., min_length=1)

class UserResponse(BaseModel):
	id: UUID
	email: str
	name: str
	avatar_url: str | None
	organization_id: UUID | None
	scrum_role: str | None
	org_role: str | None

	model_config = ConfigDict(from_attributes=True)

class AvatarResponse(BaseModel):
	avatar_url: str
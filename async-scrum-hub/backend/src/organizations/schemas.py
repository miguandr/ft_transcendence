from uuid import UUID
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field

from src.schemas.common import UserBrief

class OrgCreateRequest(BaseModel):
	name: str = Field(..., min_length=1)

class OrgCreateResponse(BaseModel):
	id: UUID
	name: str
	created_at: datetime
	created_by: UserBrief

	model_config = ConfigDict(from_attributes=True)

class OrgSelectRoleRequest(BaseModel):
	role: str = Field(..., min_length=1)

class OrgSelectRoleResponse(BaseModel):
	role: str

	model_config = ConfigDict(from_attributes=True)

class OrgGetMemberRequest(BaseModel):
	pass  # No fields needed for this request

class OrgGetMemberResponse(BaseModel):
	id: UUID
	email: str
	name: str
	avatar_url: Optional[str]
	org_role: Optional[str]
	scrum_role: Optional[str]
	tickets: list[str] #TODO space keeper
	tasks: list[str] #TODO space keeper
	blockers: list[str] #TODO space keeper

	model_config = ConfigDict(from_attributes=True)

class OrgInviteMemberRequest(BaseModel):
	email: str = Field(..., min_length=1)

class OrgInviteMemberResponse(BaseModel):
	email: str #TODO check if this is enough (api_contract is only email)

	model_config = ConfigDict(from_attributes=True)

class OrgDeleteMemberRequest(BaseModel):
	pass  # No fields needed for this request

class OrgDeleteMemberResponse(BaseModel):
	pass  #TODO check if this is correct only 204 as responce No fields needed for this response

class OrgJoinRequest(BaseModel):
	join_code: str = Field(..., min_length=1)
	scrum_role: Optional[str] = None #TODO Null not 

class OrgJoinResponse(BaseModel):
	id: UUID
	org_role: Optional[str]
	scrum_role: Optional[str]

	model_config = ConfigDict(from_attributes=True)


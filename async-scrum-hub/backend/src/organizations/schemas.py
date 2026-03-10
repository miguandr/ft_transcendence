from uuid import UUID
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from src.database.models.enums import OrgRole, ScrumRole
from src.tickets.schemas import TicketBriefOrg
from src.tasks.schemas import TaskBriefOrg
from src.blockers.schemas import BlockerBriefOrg
#from src.users.schemas import UserBrief

class OrgCreateRequest(BaseModel):
	name: str = Field(..., min_length=1)

class OrgCreateResponse(BaseModel):
	id: UUID
	name: str
	join_code: str
	created_by: UUID

	model_config = ConfigDict(from_attributes=True)

class OrgSelectRoleRequest(BaseModel):
	scrum_role: ScrumRole

class OrgSelectRoleResponse(BaseModel):
	organization_id: UUID
	scrum_role: ScrumRole

	model_config = ConfigDict(from_attributes=True)

#class OrgGetMemberRequest(BaseModel):
#	pass 

class OrgGetMemberResponse(BaseModel):
	id: UUID
	name: str
	avatar_url: Optional[str]
	org_role: OrgRole
	scrum_role: ScrumRole
	tickets: list[TicketBriefOrg]
	tasks: list[TaskBriefOrg]
	blockers: list[BlockerBriefOrg]

	model_config = ConfigDict(from_attributes=True)

class OrgInviteMemberRequest(BaseModel):
	name: str = Field(..., min_length=1)
	email: str = Field(..., min_length=1)

class OrgInviteMemberResponse(BaseModel):
	email: str #TODO check if this is enough (api_contract is only email)

	model_config = ConfigDict(from_attributes=True)

#class OrgDeleteMemberRequest(BaseModel):
#	pass  # No fields needed for this request

#class OrgDeleteMemberResponse(BaseModel):
#	pass  #TODO check if this is correct only 204 as responce No fields needed for this response

class OrgJoinRequest(BaseModel):
	join_code: str = Field(..., min_length=1)

class available_SR(BaseModel):
	role: str

class OrgJoinResponse(BaseModel):
	organization_id: UUID
	org_role: OrgRole
	available_scrum_role: list[available_SR]

	model_config = ConfigDict(from_attributes=True)


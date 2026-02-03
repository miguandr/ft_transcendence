"""
Authorization guard for the API.

This module evaluates whether a request is allowed to perform a given action,
based on the authorization rules defined in `permissions.py` and the principles
documented in `AUTHORIZATION_MODEL.md`.

Responsibilities:
- Enforce scope rules (public / global / org)
- Apply organization admin override
- Evaluate role-based permissions
- Evaluate ownership and assignment permissions when applicable

Expected inputs:
- `action`: permission action string (e.g. "tickets:update")
- `user`: authenticated user object (or None for public endpoints)
- `org_id`: organization context when available
- `resource`: domain resource object (e.g. ticket) that contains all its variables 
			(when ownership/assignment checks are required)
- `membership`: User’s organization membership information (e.g. `org_role`, `scrum_role`).

Raises:
	HTTPException: 401 si falta autenticación, 403 si no está autorizado
"""

import uuid
from typing import Optional, Protocol
from fastapi import HTTPException
from .permissions import PERMISSIONS
from src.database.models import User, Membership
import logging
logger = logging.getLogger("authz")

"""
Protocol defining the required attributes for resources that can be authorized.
Any ORM model (Ticket, Task, Standup, Blocker) that implements these attributes
will be compatible with the authorize() function.
See ARCHITECTURE.md section 9.1 for details.
"""
class AuthorizableResource(Protocol):
	organization_id: uuid.UUID
	created_by: uuid.UUID
	assignee_id: Optional[uuid.UUID]

def authorize(
	action: str,
	user: Optional[User] = None,
	org_id: Optional[uuid.UUID] = None,
	resource: Optional[AuthorizableResource] = None,
	membership: Optional[Membership] = None,
) -> None:
	
	if action not in PERMISSIONS:
		raise HTTPException(500, f"Unknown permission action: {action}")

	permission = PERMISSIONS[action]
	scope = permission["scope"]

	# PUBLIC: no JWT, no membership, no roles/owner/assignee checks
	if scope == "public":
		return

	# GLOBAL and ORG: JWT required.
	if user is None:
		raise HTTPException(401, "Authentication required")

	# GLOBAL
	if scope == "global":
		return

	# ORG
	if scope == "org":
		if org_id is None:
			if resource and resource.organization_id:
				org_id = resource.organization_id
			else:
				raise HTTPException(500, "Organization context missing")
		
		if membership is None:
			raise HTTPException(403, "Not a member of this organization")
		
		if not membership.org_role or not membership.scrum_role:
			raise HTTPException(500, "Invalid membership structure")

		# Admin override 
		if membership.org_role == "admin":
			return

		# Role-based permission
		if membership.scrum_role in permission["roles"]:
			return
		
		# Ownership check (si aplica)
		if permission["owner_allowed"] == True:
			if resource is None:
				raise HTTPException(500, "resource context missing")
			if resource.created_by == user.id:
				return

		# Assignee check (si aplica)
		if permission["assignee_allowed"] == True:
			if resource is None:
				raise HTTPException(500, "resource context missing")
			if resource.assignee_id == user.id:
				return
			
		logger.warning("DENIED | user=%s | action=%s | org=%s", user.id, action, org_id) #debuging		
		raise HTTPException(403, "Insufficient permissions")



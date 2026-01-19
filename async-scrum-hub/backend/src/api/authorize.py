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

from typing import Optional
from fastapi import HTTPException, status
from .permissions import PERMISSIONS
import logging
logger = logging.getLogger("authz")

def authorize(
	action: str,
	user: Optional[dict] = None,
	org_id: Optional[str] = None,
	resource: Optional[dict] = None,
	membership: Optional[dict] = None,
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
			if resource and resource.get("organization_id"):
				org_id = resource["organization_id"]
			else:
				raise HTTPException(500, "Organization context missing")
		
		if membership is None:
			raise HTTPException(403, "Not a member of this organization")
		
		if not membership.get("org_role") or not membership.get("scrum_role"):
			raise HTTPException(500, "Invalid membership structure")

		# Admin override 
		if membership.get("org_role") == "admin":
			return

		# Role-based permission
		if membership.get("scrum_role") in permission["roles"]:
			return
		
		# Ownership check (si aplica)
		if permission["owner_allowed"] == True:
			if resource is None:
				raise HTTPException(500, "resource context missing")
			if resource.get("created_by") == user["id"]:
				return

		# Assignee check (si aplica)
		if permission["assignee_allowed"] == True:
			if resource is None:
				raise HTTPException(500, "resource context missing")
			if resource.get("assignee_id") == user["id"]:
				return
			
		logger.warning("DENIED | user=%s | action=%s | org=%s", user.get("id"), action, org_id ) #debuging		
		raise HTTPException(403, "Insufficient permissions")



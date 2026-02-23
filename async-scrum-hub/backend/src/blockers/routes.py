import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from src.database import get_db
from src.database.models import User
from src.database.models.organization import Organization
from src.database.models.blocker import Blocker
from src.api.deps import require_org_permission, require_resource_permission
from src.blockers import service
from src.blockers.schemas import (
	BlockerCreateRequest,
	BlockerUpdateRequest,
	BlockerResponse,
)

router = APIRouter()


def get_blocker_loader(blocker_id: uuid.UUID, db: Session = Depends(get_db)) -> Blocker:
	return service.get_blocker_by_id(blocker_id, db)


@router.post(
	"/organizations/{org_id}/blockers",
	response_model=BlockerResponse,
	status_code=status.HTTP_201_CREATED,
)
def create_blocker(
	org_id: uuid.UUID,
	body: BlockerCreateRequest,
	db: Session = Depends(get_db),
	current_user: User = Depends(require_org_permission("organizations:blockers:create")),
):
	org = db.query(Organization).filter(Organization.id == org_id).first()
	if not org:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail={"error": {"code": "NOT_FOUND", "message": "Organization not found"}},
		)

	blocker = service.create_blocker(db, org_id, current_user, body.description, body.ticket_id, body.assignee_id)
	return BlockerResponse(
		id=blocker.id,
		description=blocker.description,
		status=blocker.status,
		created_by=blocker.creator,
		assignee=blocker.assignee,
		ticket=blocker.ticket,
		created_at=blocker.created_at,
		resolved_at=blocker.resolved_at,
	)


@router.get(
	"/organizations/{org_id}/blockers",
	response_model=list[BlockerResponse],
	status_code=status.HTTP_200_OK,
)
def list_blockers(
	org_id: uuid.UUID,
	status_filter: Optional[str] = Query(None, alias="status"),
	db: Session = Depends(get_db),
	current_user: User = Depends(require_org_permission("organizations:blockers:list")),
):
	org = db.query(Organization).filter(Organization.id == org_id).first()
	if not org:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail={"error": {"code": "NOT_FOUND", "message": "Organization not found"}},
		)

	if status_filter is not None and status_filter not in ("open", "resolved"):
		raise HTTPException(
			status_code=status.HTTP_400_BAD_REQUEST,
			detail={"error": {"code": "INVALID_INPUT", "message": "status must be 'open' or 'resolved'"}},
		)

	blockers = service.list_blockers(db, org_id, status_filter)
	return [
		BlockerResponse(
			id=b.id,
			description=b.description,
			status=b.status,
			created_by=b.creator,
			assignee=b.assignee,
			ticket=b.ticket,
			created_at=b.created_at,
			resolved_at=b.resolved_at,
		)
		for b in blockers
	]


@router.patch(
	"/blockers/{blocker_id}",
	response_model=BlockerResponse,
	status_code=status.HTTP_200_OK,
)
def update_blocker(
	body: BlockerUpdateRequest,
	db: Session = Depends(get_db),
	blocker: Blocker = Depends(require_resource_permission("blockers:update", get_blocker_loader)),
):
	updates = body.model_dump(exclude_unset=True)
	updated = service.update_blocker(db, blocker, updates)
	return BlockerResponse(
		id=updated.id,
		description=updated.description,
		status=updated.status,
		created_by=updated.creator,
		assignee=updated.assignee,
		ticket=updated.ticket,
		created_at=updated.created_at,
		resolved_at=updated.resolved_at,
	)


@router.patch(
	"/blockers/{blocker_id}/resolve",
	status_code=status.HTTP_204_NO_CONTENT,
)
def resolve_blocker(
	db: Session = Depends(get_db),
	blocker: Blocker = Depends(require_resource_permission("blockers:resolve", get_blocker_loader)),
):
	service.resolve_blocker(db, blocker)

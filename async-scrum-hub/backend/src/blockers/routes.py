"""
Blockers API routes.

AUTHORIZATION DEPENDENCIES (from src.api.deps):
- require_org_member: For list endpoints where any member can access
- require_org_permission(action): For endpoints with org_id in path
- require_resource_permission(action, loader): For endpoints with blocker_id in path

LOADER REQUIREMENT:
For require_resource_permission, you must create a loader function in this module's deps.py.
The loader MUST have these parameters:
    - blocker_id: uuid.UUID  (extracted from path by FastAPI)
    - db: Session = Depends(get_db)  (database session)
The loader MUST return the Blocker object or raise HTTPException(404) if not found.

Example loader signature:
    def get_blocker(blocker_id: uuid.UUID, db: Session = Depends(get_db)) -> Blocker:
        blocker = db.query(Blocker).filter(Blocker.id == blocker_id).first()
        if not blocker:
            raise HTTPException(404, "Blocker not found")
        return blocker
"""

# TODO: Implement blocker routes - assigned to Malu

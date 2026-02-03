"""
Standups API routes.

AUTHORIZATION DEPENDENCIES (from src.api.deps):
- require_org_member: For list endpoints where any member can access
- require_org_permission(action): For endpoints with org_id in path
- require_resource_permission(action, loader): For endpoints with standup_id in path

LOADER REQUIREMENT:
For require_resource_permission, you must create a loader function in this module's deps.py.
The loader MUST have these parameters:
    - standup_id: uuid.UUID  (extracted from path by FastAPI)
    - db: Session = Depends(get_db)  (database session)
The loader MUST return the Standup object or raise HTTPException(404) if not found.

Example loader signature:
    def get_standup(standup_id: uuid.UUID, db: Session = Depends(get_db)) -> Standup:
        standup = db.query(Standup).filter(Standup.id == standup_id).first()
        if not standup:
            raise HTTPException(404, "Standup not found")
        return standup
"""

# TODO: Implement standup routes - assigned to Malu

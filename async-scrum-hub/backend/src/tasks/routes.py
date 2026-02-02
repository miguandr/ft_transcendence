"""
Tasks API routes.

AUTHORIZATION DEPENDENCIES (from src.api.deps):
- require_org_member: For list endpoints where any member can access
- require_org_permission(action): For endpoints with org_id in path
- require_resource_permission(action, loader): For endpoints with task_id in path

LOADER REQUIREMENT:
For require_resource_permission, you must create a loader function in this module's deps.py.
The loader MUST have these parameters:
    - task_id: uuid.UUID  (extracted from path by FastAPI)
    - db: Session = Depends(get_db)  (database session)
The loader MUST return the Task object or raise HTTPException(404) if not found.

Example loader signature:
    def get_task(task_id: uuid.UUID, db: Session = Depends(get_db)) -> Task:
        task = db.query(Task).filter(Task.id == task_id).first()
        if not task:
            raise HTTPException(404, "Task not found")
        return task
"""

# TODO: Implement task routes - assigned to Freddy

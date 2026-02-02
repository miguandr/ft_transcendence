"""
Organizations API routes.

AUTHORIZATION DEPENDENCIES (from src.api.deps):
- require_org_member: For endpoints where any member can access
- require_org_permission(action): For endpoints that require specific permissions

NOTE: Organizations always have org_id in path, so use require_org_permission(action).
No loader is needed for organization endpoints.
"""

# TODO: Implement organization routes

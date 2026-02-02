"""
Standup model for the database.

IMPORTANT - Authorization Fields Required (see ARCHITECTURE.md section 9.1):
- organization_id: UUID FK to organizations (required for authorization checks)
- created_by: UUID FK to users (required for ownership checks)

NOTE: Standup does not have assignee_id (standups are not assignable)
"""

# TODO: Implement Standup model - assigned to Malu

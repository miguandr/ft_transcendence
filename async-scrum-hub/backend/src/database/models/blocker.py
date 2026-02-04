"""
Blocker model for the database.

IMPORTANT - Authorization Fields Required (see ARCHITECTURE.md section 9.1):
- organization_id: UUID FK to organizations (required for authorization checks)
- created_by: UUID FK to users (required for ownership checks)
- assignee_id: UUID FK to users, nullable (required for assignee checks)

FOREIGNKEYS - Add ondelete for cascade behavior:
- organization_id: ForeignKey("organizations.id", ondelete="CASCADE")
- created_by: ForeignKey("users.id", ondelete="CASCADE")
- assignee_id: ForeignKey("users.id", ondelete="SET NULL")  # nullable, so SET NULL

RELATIONSHIPS - Add Relationships and back_populates for bidirectional access:
- organization: relationship("Organization", back_populates="blockers")
- creator: relationship("User", foreign_keys=[created_by], back_populates="created_blockers")
- assignee: relationship("User", foreign_keys=[assignee_id], back_populates="assigned_blockers")

NOTE: Organization and User models will need the reverse relationships added:
- Organization.blockers: list["Blocker"]
- User.created_blockers: list["Blocker"]
- User.assigned_blockers: list["Blocker"]

See User, Membership, Organization models for complete examples.
"""

# TODO: Implement Blocker model - assigned to Malu

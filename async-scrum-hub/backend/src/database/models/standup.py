"""
Standup model for the database.

IMPORTANT - Authorization Fields Required (see ARCHITECTURE.md section 9.1):
- organization_id: UUID FK to organizations (required for authorization checks)
- created_by: UUID FK to users (required for ownership checks)

NOTE: Standup does not have assignee_id (standups are not assignable)

FOREIGNKEYS - Add ondelete for cascade behavior:
- organization_id: ForeignKey("organizations.id", ondelete="CASCADE")
- created_by: ForeignKey("users.id", ondelete="CASCADE")

RELATIONSHIPS - Add Relationships and back_populates for bidirectional access:
- organization: relationship("Organization", back_populates="standups")
- creator: relationship("User", back_populates="standups")

NOTE: Organization and User models will need the reverse relationships added:
- Organization.standups: list["Standup"]
- User.standups: list["Standup"]

See User, Membership, Organization models for complete examples.
"""

# TODO: Implement Standup model - assigned to Malu

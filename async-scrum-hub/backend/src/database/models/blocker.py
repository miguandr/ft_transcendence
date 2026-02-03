"""
Blocker model for the database.

IMPORTANT - Authorization Fields Required (see ARCHITECTURE.md section 9.1):
- organization_id: UUID FK to organizations (required for authorization checks)
- created_by: UUID FK to users (required for ownership checks)
- assignee_id: UUID FK to users, nullable (required for assignee checks)

RELATIONSHIPS to add (see User, Membership, Organization for examples):
- organization: relationship("Organization", foreign_keys=[organization_id])
- creator: relationship("User", foreign_keys=[created_by])
- assignee: relationship("User", foreign_keys=[assignee_id])

Example:
    from sqlalchemy.orm import relationship
    from typing import TYPE_CHECKING

    if TYPE_CHECKING:
        from .user import User
        from .organization import Organization

    class Blocker(Base):
        # ForeignKeys
        organization_id: Mapped[uuid.UUID] = mapped_column(...)
        created_by: Mapped[uuid.UUID] = mapped_column(...)
        assignee_id: Mapped[uuid.UUID | None] = mapped_column(...)

        # Relationships
        organization: Mapped["Organization"] = relationship("Organization", foreign_keys=[organization_id])
        creator: Mapped["User"] = relationship("User", foreign_keys=[created_by])
        assignee: Mapped["User | None"] = relationship("User", foreign_keys=[assignee_id])
"""

# TODO: Implement Blocker model - assigned to Malu

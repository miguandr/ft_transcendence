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

See User, Organization models for complete examples.
"""

import uuid
from datetime import datetime
from enum import Enum
from sqlalchemy import DateTime, Text, ForeignKey, Enum as SQLEnum, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..base import Base
from typing import TYPE_CHECKING

if TYPE_CHECKING:
	from .user import User
	from .organization import Organization
	from .ticket import Ticket


class BlockerStatus(str, Enum):
	"""Blocker status enum: open or resolved"""
	OPEN = "open"
	RESOLVED = "resolved"


class Blocker(Base):
	"""
	Blocker model representing impediments that block progress.

	Blockers are issues that prevent team members from completing their work.
	They can be assigned to developers and optionally linked to tickets.

	Business Rules:
	- Blockers cannot be deleted, only resolved
	- Resolution is irreversible (status transition: open → resolved)
	- Only users with Developer role can be assigned as assignees
	- Default status when created: open
	- Resolved blockers get a resolved_at timestamp
	"""

	__tablename__ = "blockers"

	# Primary key
	id: Mapped[uuid.UUID] = mapped_column(
		UUID(as_uuid=True),
		primary_key=True,
		default=uuid.uuid4
	)

	# Authorization fields (required for permission checks)
	organization_id: Mapped[uuid.UUID] = mapped_column(
		UUID(as_uuid=True),
		ForeignKey("organizations.id", ondelete="CASCADE"),
		nullable=False,
		index=True
	)

	created_by: Mapped[uuid.UUID] = mapped_column(
		UUID(as_uuid=True),
		ForeignKey("users.id", ondelete="CASCADE"),
		nullable=False,
		index=True
	)

	assignee_id: Mapped[uuid.UUID | None] = mapped_column(
		UUID(as_uuid=True),
		ForeignKey("users.id", ondelete="SET NULL"),
		nullable=True,
		index=True
	)

	# Blocker content fields
	description: Mapped[str] = mapped_column(
		Text,
		nullable=False
	)

	status: Mapped[BlockerStatus] = mapped_column(
		SQLEnum(BlockerStatus, name="blocker_status", create_type=True, values_callable=lambda x: [e.value for e in x]),
		nullable=False,
		default=BlockerStatus.OPEN,
		server_default="open",
		index=True
	)

	ticket_id: Mapped[uuid.UUID | None] = mapped_column(
		UUID(as_uuid=True),
		ForeignKey("tickets.id", ondelete="CASCADE"),
		nullable=True,
		index=True
	)

	# Timestamps
	created_at: Mapped[datetime] = mapped_column(
		DateTime(timezone=True),
		server_default=func.now(),
		nullable=False
	)

	updated_at: Mapped[datetime] = mapped_column(
		DateTime(timezone=True),
		server_default=func.now(),
		onupdate=func.now(),
		nullable=False
	)

	resolved_at: Mapped[datetime | None] = mapped_column(
		DateTime(timezone=True),
		nullable=True
	)

	# Relationships
	organization: Mapped["Organization"] = relationship(
		"Organization",
		back_populates="blockers"
	)

	creator: Mapped["User"] = relationship(
		"User",
		foreign_keys=[created_by],
		back_populates="created_blockers"
	)

	assignee: Mapped["User | None"] = relationship(
		"User",
		foreign_keys=[assignee_id],
		back_populates="assigned_blockers"
	)
	ticket: Mapped["Ticket | None"] = relationship(
		"Ticket",
		back_populates="blockers"
	)

	def __repr__(self):
		return f"<Blocker(id={self.id}, status={self.status.value}, created_by={self.created_by})>"

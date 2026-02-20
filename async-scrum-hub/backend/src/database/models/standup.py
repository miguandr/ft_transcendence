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
- creator: relationship("User", back_populates="standups_created")

NOTE: Organization and User models will need the reverse relationships added:
- Organization.standups: list["Standup"]
- User.standups_created: list["Standup"]

See User, Organization models for complete examples.
"""

import uuid
from datetime import datetime, date
from sqlalchemy import DateTime, Text, Date, ForeignKey, UniqueConstraint, func, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..base import Base
from typing import TYPE_CHECKING

if TYPE_CHECKING:
	from .user import User
	from .organization import Organization


class Standup(Base):
	"""
	Standup model representing daily standup submissions.

	A standup captures what a team member accomplished yesterday and plans to work on today.
	One standup per user per day per organization is enforced via unique constraint.

	Business Rules:
	- One standup per user per day per organization
	- Editable only on the day of creation
	- `yesterday` is auto-populated from previous day's `today` field
	- `blocker_ids` is auto-populated with active (open) blockers
	"""

	__tablename__ = "standups"

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

	# Standup content fields
	today: Mapped[str] = mapped_column(
		Text,
		nullable=False
	)

	yesterday: Mapped[str | None] = mapped_column(
		Text,
		nullable=True
	)

	blocker_ids: Mapped[list[uuid.UUID] | None] = mapped_column(
		JSON,
		nullable=True,
		default=list
	)

	# Date field for uniqueness constraint
	standup_date: Mapped[date] = mapped_column(
		Date,
		nullable=False,
		server_default=func.current_date(),
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

	# Relationships
	organization: Mapped["Organization"] = relationship(
		"Organization",
		back_populates="standups"
	)

	creator: Mapped["User"] = relationship(
		"User",
		foreign_keys=[created_by],
		back_populates="standups_created"
	)

	# Table constraints
	__table_args__ = (
		UniqueConstraint(
			'organization_id',
			'created_by',
			'standup_date',
			name='uq_standup_per_user_per_day_per_org'
		),
	)

	def __repr__(self):
		return f"<Standup(id={self.id}, created_by={self.created_by}, date={self.standup_date})>"

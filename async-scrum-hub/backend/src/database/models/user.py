import uuid
from datetime import datetime
from sqlalchemy import CheckConstraint, DateTime, String, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..base import Base
from typing import TYPE_CHECKING

if TYPE_CHECKING:
	from .organization import Organization
	from .standup import Standup
	from .blocker import Blocker
	from .ticket import Ticket
	from .task import Task

class User(Base):
	__tablename__ = "users"
	__table_args__ = (
		CheckConstraint(
			"org_role IN ('admin', 'member')",
			name="ck_user_org_role"
		),
		CheckConstraint(
			"scrum_role IN ('scrum_master', 'product_owner', 'developer')",
			name="ck_user_scrum_role"
		),
	)

	id: Mapped[uuid.UUID] = mapped_column(
		UUID(as_uuid=True),
		primary_key=True,
		default=uuid.uuid4
	)

	email: Mapped[str] = mapped_column(
		String,
		unique=True,
		index=True,
		nullable=False
	)

	name: Mapped[str] = mapped_column(
		String,
		nullable=False
	)

	password_hash: Mapped[str] = mapped_column(
		String,
		nullable=False
	)

	avatar_url: Mapped[str | None] = mapped_column(
		String,
		nullable=True,
	)

	organization_id: Mapped[uuid.UUID | None] = mapped_column(
		UUID(as_uuid=True),
		ForeignKey("organizations.id", ondelete="SET NULL"),  # If Org is deleted, set NULL
		index=True,
		nullable=True,
	)

	org_role: Mapped[str | None] = mapped_column(
		String(20),
		nullable=True,
		default=None,
	)

	scrum_role: Mapped[str | None] = mapped_column(
		String(20),
		nullable=True,
		default=None,
	)

	# Relationships

	# The organization the user belongs to (nullable if not in any org)
	organization: Mapped["Organization | None"] = relationship(
		"Organization",
		foreign_keys=[organization_id],
		back_populates="users"
	)

	# All organizations this user has created (as founder/owner)
	created_organizations: Mapped[list["Organization"]] = relationship(
		"Organization",
		foreign_keys="Organization.created_by",
		back_populates="creator",
		passive_deletes=True
	)

	tasks_created: Mapped[list["Task"]] = relationship(
		"Task",
		foreign_keys="Task.created_by",
		back_populates="creator",
		passive_deletes=True,
	)

	standups_created: Mapped[list["Standup"]] = relationship(
		"Standup",
		foreign_keys="Standup.created_by",
		back_populates="creator",
		cascade="all, delete-orphan"  # If User is deleted, delete their standups
	)

	created_blockers: Mapped[list["Blocker"]] = relationship(
		"Blocker",
		foreign_keys="Blocker.created_by",
		back_populates="creator",
		cascade="all, delete-orphan"  # If User is deleted, delete their created blockers
	)

	assigned_blockers: Mapped[list["Blocker"]] = relationship(
		"Blocker",
		foreign_keys="Blocker.assignee_id",
		back_populates="assignee",
		passive_deletes=True  # DB handles SET NULL via FK (defined in Blocker)
	)

	tickets_created: Mapped[list["Ticket"]] = relationship(
		"Ticket",
		foreign_keys="Ticket.created_by",
		back_populates="creator",
		passive_deletes=True,
	)

	tickets_assigned: Mapped[list["Ticket"]] = relationship(
		"Ticket",
		foreign_keys="Ticket.assignee_id",
		back_populates="assignee",
		passive_deletes=True,
	)

	tasks_assigned: Mapped[list["Task"]] = relationship(
		"Task",
		foreign_keys="Task.assignee_id",
		back_populates="assignee",
		passive_deletes=True,
	)
	# End of Relationships

	created_at: Mapped[datetime] = mapped_column(
		DateTime(timezone=True),
		server_default=func.now(),
		nullable=False
	)

	updated_at: Mapped[datetime] = mapped_column(
		DateTime(timezone=True),
		server_default=func.now(),
		onupdate=func.now(),
		nullable=False,
	)

"""
Task model for the database.

IMPORTANT - Authorization Fields Required (see ARCHITECTURE.md section 9.1):
- organization_id: UUID FK to organizations (required for authorization checks)
- created_by: UUID FK to users (required for ownership checks)
- assignee_id: UUID FK to users, nullable (required for assignee checks)
"""


import uuid
from datetime import datetime
from sqlalchemy import DateTime, String, ForeignKey, func, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..base import Base
from .enums import TaskStatus
from typing import TYPE_CHECKING

if TYPE_CHECKING:
	from .ticket import Ticket
	from .user import User
	from .organization import Organization


class Task(Base):
	__tablename__ = "tasks"

	id: Mapped[uuid.UUID] = mapped_column(
		UUID(as_uuid=True),
		primary_key=True,
		default=uuid.uuid4
	)

	title: Mapped[str] = mapped_column(
		String,
		nullable=False
	)

	description: Mapped[str | None] = mapped_column(
		String,
		nullable=True
	)

	status: Mapped[TaskStatus] = mapped_column(
		Enum(
			TaskStatus,
			name="task_status",
			native_enum=True,
			validate_strings=True
			),
		nullable=False,
		default=TaskStatus.IN_PROGRESS,
	)

	ticket_id: Mapped[uuid.UUID] = mapped_column(
		UUID(as_uuid=True),
		ForeignKey("tickets.id", ondelete="CASCADE"),
		nullable=False
	)

	created_by: Mapped[uuid.UUID] = mapped_column(
		UUID(as_uuid=True),
		ForeignKey("users.id", ondelete="CASCADE"),
		nullable=False
	)

	organization_id: Mapped[uuid.UUID] = mapped_column(
		UUID(as_uuid=True),
		ForeignKey("organizations.id", ondelete="CASCADE"),
		nullable=False,
	)

	assignee_id: Mapped[uuid.UUID | None] = mapped_column(
		UUID(as_uuid=True),
		ForeignKey("users.id", ondelete="SET NULL"),
		nullable=True
	)

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

#Relationships

	ticket: Mapped["Ticket"] = relationship(
		"Ticket",
		back_populates="tasks",
		foreign_keys=[ticket_id],
	)

	creator: Mapped["User"] = relationship(
		"User",
		foreign_keys=[created_by],
		back_populates="tasks_created",
	)

	assignee: Mapped["User | None"] = relationship(
		"User",
		foreign_keys=[assignee_id],
		back_populates="tasks_assigned",
	)

	organization: Mapped["Organization"] = relationship(
		"Organization",
		back_populates="tasks",
	)



import uuid
from datetime import datetime
from sqlalchemy import DateTime, String, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..base import Base
from typing import TYPE_CHECKING

if TYPE_CHECKING:
	from .user import User
	from .membership import Membership

class Organization(Base):
	__tablename__ = "organizations"

	id: Mapped[uuid.UUID] = mapped_column(
		UUID(as_uuid=True), 
		primary_key=True, 
		default=uuid.uuid4
	)

	name: Mapped[str] = mapped_column(
		String,
		nullable=False
	)  

	join_code: Mapped[str] = mapped_column(
		String(10),
		unique=True,
		index=True,
		nullable=False
	)
 
	created_by: Mapped[uuid.UUID] = mapped_column(
		UUID(as_uuid=True),
		ForeignKey("users.id", ondelete="RESTRICT"),  # Prevent deleting User if they created orgs
		nullable=False
	)

	# Relationships
	creator: Mapped["User"] = relationship(
		"User",
		foreign_keys=[created_by],
		back_populates="created_organizations"
	)

	memberships: Mapped[list["Membership"]] = relationship(
		"Membership",
		back_populates="organization",
		cascade="all, delete-orphan"  # If Org is deleted, delete its memberships
	)

	current_users: Mapped[list["User"]] = relationship(
		"User",
		foreign_keys="User.current_organization_id",
		back_populates="current_organization",
		passive_deletes=True  # DB handles SET NULL via FK (defined in User)
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
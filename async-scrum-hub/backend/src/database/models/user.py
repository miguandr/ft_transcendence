import uuid
from datetime import datetime
from sqlalchemy import DateTime, String, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..base import Base
from typing import TYPE_CHECKING

if TYPE_CHECKING:
	from .organization import Organization

class User(Base):
	__tablename__ = "users"

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

	#check with migue if pass check happens in the frontend
	password_hash: Mapped[str] = mapped_column(
		String, 
		nullable=False
	)

	current_organization_id: Mapped[uuid.UUID | None] = mapped_column(
		UUID(as_uuid=True),
		ForeignKey("organizations.id"),
		nullable=True,
	)

	# Relationships
	current_organization: Mapped["Organization | None"] = relationship(
		"Organization",
		foreign_keys=[current_organization_id]
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
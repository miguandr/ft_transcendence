import uuid
import enum
from sqlalchemy import String, ForeignKey, UniqueConstraint, CheckConstraint, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from ..base import Base


class OrgRole(str, enum.Enum):
	admin = "admin"
	member = "member"


class ScrumRole(str, enum.Enum):
	scrum_master = "scrum_master"
	product_owner = "product_owner"
	developer = "developer"


class Membership(Base):
	__tablename__ = "memberships"
	__table_args__ = (
		UniqueConstraint(
			"user_id", 
			"organization_id", 
			name="uq_memberships_user_org"
		),
		CheckConstraint(
			"org_role IN ('admin', 'member')", 
			name="ck_membership_org_role"
		),
		CheckConstraint(
			"scrum_role IN ('scrum_master', 'product_owner', 'developer')", 
			name="ck_membership_scrum_role"
		),
	)

	id: Mapped[uuid.UUID] = mapped_column(
		UUID(as_uuid=True),
		primary_key=True,
		default=uuid.uuid4
	)

	user_id: Mapped[uuid.UUID] = mapped_column(
		UUID(as_uuid=True),
		ForeignKey("users.id"),
		nullable=False
	)

	organization_id: Mapped[uuid.UUID] = mapped_column(
		UUID(as_uuid=True),
		ForeignKey("organizations.id"),
		nullable=False,
	)

	org_role: Mapped[str] = mapped_column(
		String(20),
		nullable=False,
		default=OrgRole.member.value
	)

	scrum_role: Mapped[str] = mapped_column(
		String(20),
		nullable=False,
		default=ScrumRole.developer.value
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
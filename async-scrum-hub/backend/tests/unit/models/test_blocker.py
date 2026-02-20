"""
Unit tests for Blocker model.

Tests model structure, relationships, and constraints without database.
"""

import pytest
from uuid import uuid4

from src.database.models import Blocker
from src.database.models.blocker import BlockerStatus


class TestBlockerModel:
    """Test Blocker model structure and attributes."""

    def test_blocker_table_name(self):
        """Test that table name is correctly set."""
        assert Blocker.__tablename__ == "blockers"

    def test_blocker_has_required_columns(self):
        """Test that Blocker model has all required columns."""
        columns = [c.name for c in Blocker.__table__.columns]

        required_columns = [
            'id',
            'organization_id',
            'created_by',
            'assignee_id',
            'description',
            'status',
            'ticket_id',
            'created_at',
            'resolved_at'
        ]

        for column in required_columns:
            assert column in columns, f"Missing column: {column}"

    def test_blocker_foreign_keys(self):
        """Test that Blocker has correct foreign keys."""
        foreign_keys = list(Blocker.__table__.foreign_keys)

        fk_targets = [fk.target_fullname for fk in foreign_keys]
        assert 'organizations.id' in fk_targets
        assert fk_targets.count('users.id') == 2, "Should have 2 FKs to users (created_by, assignee_id)"

    def test_blocker_relationships(self):
        """Test that Blocker has correct relationships."""
        assert hasattr(Blocker, 'organization')
        assert hasattr(Blocker, 'creator')
        assert hasattr(Blocker, 'assignee')
        assert hasattr(Blocker, 'ticket')

    def test_blocker_repr(self):
        """Test Blocker __repr__ method."""
        blocker_id = uuid4()
        user_id = uuid4()
        org_id = uuid4()

        blocker = Blocker(
            id=blocker_id,
            organization_id=org_id,
            created_by=user_id,
            description="Test blocker",
            status=BlockerStatus.OPEN
        )

        repr_str = repr(blocker)
        assert str(blocker_id) in repr_str
        assert str(user_id) in repr_str
        assert BlockerStatus.OPEN.value in repr_str


class TestBlockerColumnTypes:
    """Test Blocker column types and nullability."""

    def test_id_column_is_uuid(self):
        """Test id column is UUID type."""
        id_column = Blocker.__table__.columns['id']
        assert str(id_column.type) == 'UUID'
        assert id_column.primary_key is True
        assert id_column.nullable is False

    def test_organization_id_not_nullable(self):
        """Test organization_id is required."""
        org_column = Blocker.__table__.columns['organization_id']
        assert org_column.nullable is False

    def test_created_by_not_nullable(self):
        """Test created_by is required."""
        created_by_column = Blocker.__table__.columns['created_by']
        assert created_by_column.nullable is False

    def test_assignee_id_is_nullable(self):
        """Test assignee_id is optional."""
        assignee_column = Blocker.__table__.columns['assignee_id']
        assert assignee_column.nullable is True

    def test_description_not_nullable(self):
        """Test description is required."""
        desc_column = Blocker.__table__.columns['description']
        assert desc_column.nullable is False

    def test_status_not_nullable(self):
        """Test status is required."""
        status_column = Blocker.__table__.columns['status']
        assert status_column.nullable is False

    def test_ticket_id_is_nullable(self):
        """Test ticket_id is optional."""
        task_column = Blocker.__table__.columns['ticket_id']
        assert task_column.nullable is True

    def test_resolved_at_is_nullable(self):
        """Test resolved_at is optional."""
        resolved_column = Blocker.__table__.columns['resolved_at']
        assert resolved_column.nullable is True


class TestBlockerStatus:
    """Test BlockerStatus enum."""

    def test_blocker_status_has_correct_values(self):
        """Test BlockerStatus enum has OPEN and RESOLVED."""
        assert hasattr(BlockerStatus, 'OPEN')
        assert hasattr(BlockerStatus, 'RESOLVED')
        assert BlockerStatus.OPEN.value == 'open'
        assert BlockerStatus.RESOLVED.value == 'resolved'

    def test_blocker_status_enum_values(self):
        """Test all BlockerStatus values."""
        values = [status.value for status in BlockerStatus]
        assert 'open' in values
        assert 'resolved' in values
        assert len(values) == 2


class TestBlockerForeignKeyOnDelete:
    """Test Blocker foreign key cascade behaviors."""

    def test_organization_cascade_delete(self):
        """Test organization FK has CASCADE delete."""
        org_fk = None
        for fk in Blocker.__table__.foreign_keys:
            if 'organizations.id' in fk.target_fullname:
                org_fk = fk
                break

        assert org_fk is not None
        assert org_fk.ondelete == 'CASCADE'

    def test_created_by_cascade_delete(self):
        """Test created_by FK has CASCADE delete."""
        created_by_fk = None
        for fk in Blocker.__table__.foreign_keys:
            if fk.parent.name == 'created_by':
                created_by_fk = fk
                break

        assert created_by_fk is not None
        assert created_by_fk.ondelete == 'CASCADE'

    def test_assignee_set_null_delete(self):
        """Test assignee_id FK has SET NULL delete."""
        assignee_fk = None
        for fk in Blocker.__table__.foreign_keys:
            if fk.parent.name == 'assignee_id':
                assignee_fk = fk
                break

        assert assignee_fk is not None
        assert assignee_fk.ondelete == 'SET NULL'

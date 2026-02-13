"""
Unit tests for Standup model.

Tests model structure, relationships, and constraints without database.
"""

import pytest
from datetime import date
from uuid import uuid4

from src.database.models import Standup


class TestStandupModel:
    """Test Standup model structure and attributes."""

    def test_standup_table_name(self):
        """Test that table name is correctly set."""
        assert Standup.__tablename__ == "standups"

    def test_standup_has_required_columns(self):
        """Test that Standup model has all required columns."""
        columns = [c.name for c in Standup.__table__.columns]

        required_columns = [
            'id',
            'organization_id',
            'created_by',
            'today',
            'yesterday',
            'blocker_ids',
            'standup_date',
            'created_at',
            'updated_at'
        ]

        for column in required_columns:
            assert column in columns, f"Missing column: {column}"

    def test_standup_has_unique_constraint(self):
        """Test that Standup has unique constraint on org/user/date."""
        constraints = [c for c in Standup.__table__.constraints]
        unique_constraints = [c for c in constraints if hasattr(c, 'columns') and c.name]

        unique_constraint_names = [c.name for c in unique_constraints]
        assert 'uq_standup_per_user_per_day_per_org' in unique_constraint_names

    def test_standup_foreign_keys(self):
        """Test that Standup has correct foreign keys."""
        foreign_keys = list(Standup.__table__.foreign_keys)

        fk_targets = [fk.target_fullname for fk in foreign_keys]
        assert 'organizations.id' in fk_targets
        assert 'users.id' in fk_targets

    def test_standup_relationships(self):
        """Test that Standup has correct relationships."""
        assert hasattr(Standup, 'organization')
        assert hasattr(Standup, 'creator')

    def test_standup_repr(self):
        """Test Standup __repr__ method."""
        standup_id = uuid4()
        user_id = uuid4()
        org_id = uuid4()
        today = date.today()

        # Create standup instance (won't save to DB in unit test)
        standup = Standup(
            id=standup_id,
            organization_id=org_id,
            created_by=user_id,
            today="Test standup",
            standup_date=today
        )

        repr_str = repr(standup)
        assert str(standup_id) in repr_str
        assert str(user_id) in repr_str
        assert str(today) in repr_str


class TestStandupColumnTypes:
    """Test Standup column types and nullability."""

    def test_id_column_is_uuid(self):
        """Test id column is UUID type."""
        id_column = Standup.__table__.columns['id']
        assert str(id_column.type) == 'UUID'
        assert id_column.primary_key is True
        assert id_column.nullable is False

    def test_organization_id_not_nullable(self):
        """Test organization_id is required."""
        org_column = Standup.__table__.columns['organization_id']
        assert org_column.nullable is False

    def test_created_by_not_nullable(self):
        """Test created_by is required."""
        created_by_column = Standup.__table__.columns['created_by']
        assert created_by_column.nullable is False

    def test_today_not_nullable(self):
        """Test today field is required."""
        today_column = Standup.__table__.columns['today']
        assert today_column.nullable is False

    def test_yesterday_is_nullable(self):
        """Test yesterday field is optional."""
        yesterday_column = Standup.__table__.columns['yesterday']
        assert yesterday_column.nullable is True

    def test_blocker_ids_is_nullable(self):
        """Test blocker_ids field is optional."""
        blocker_ids_column = Standup.__table__.columns['blocker_ids']
        assert blocker_ids_column.nullable is True

    def test_standup_date_not_nullable(self):
        """Test standup_date is required."""
        date_column = Standup.__table__.columns['standup_date']
        assert date_column.nullable is False


class TestStandupConstraints:
    """Test Standup business rule constraints."""

    def test_unique_constraint_columns(self):
        """Test unique constraint includes correct columns."""
        unique_constraint = None
        for constraint in Standup.__table__.constraints:
            if hasattr(constraint, 'name') and constraint.name == 'uq_standup_per_user_per_day_per_org':
                unique_constraint = constraint
                break

        assert unique_constraint is not None, "Unique constraint not found"

        column_names = [c.name for c in unique_constraint.columns]
        assert 'organization_id' in column_names
        assert 'created_by' in column_names
        assert 'standup_date' in column_names

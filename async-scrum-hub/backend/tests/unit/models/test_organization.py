"""
Unit tests for Organization model.

Tests model structure, relationships, and constraints without database.

to test an especific error (ex:test_organization_table_name):
docker-compose exec backend pytest tests/unit/models/test_organization.py::TestOrganizationModel::test_organization_table_name -v --tb=long
"""

import pytest
from uuid import uuid4

from src.database.models import Organization


class TestOrganizationModel:
    """Test Organization model structure and attributes."""

    def test_organization_table_name(self):
        """Test that table name is correctly set."""
        assert Organization.__tablename__ == "organizations"

    def test_organization_has_required_columns(self):
        """Test that Organization model has all required columns."""
        columns = [c.name for c in Organization.__table__.columns]

        required_columns = [
            'id',
            'name',
            'join_code',
            'created_by',
            'created_at',
            'updated_at'
        ]

        for column in required_columns:
            assert column in columns, f"Missing column: {column}"

    def test_organization_foreign_keys(self):
        """Test that Organization has correct foreign keys."""
        foreign_keys = list(Organization.__table__.foreign_keys)

        fk_targets = [fk.target_fullname for fk in foreign_keys]
        assert 'users.id' in fk_targets

    def test_organization_relationships(self):
        """Test that Organization has correct relationships."""
        assert hasattr(Organization, 'creator')
        assert hasattr(Organization, 'users')
        assert hasattr(Organization, 'standups')
        assert hasattr(Organization, 'blockers')
        assert hasattr(Organization, 'tickets')
        assert hasattr(Organization, 'tasks')


class TestOrganizationColumnTypes:
    """Test Organization column types and nullability."""

    def test_id_column_is_uuid(self):
        """Test id column is UUID type."""
        id_column = Organization.__table__.columns['id']
        assert str(id_column.type) == 'UUID'
        assert id_column.primary_key is True
        assert id_column.nullable is False

    def test_name_not_nullable(self):
        """Test name is required."""
        name_column = Organization.__table__.columns['name']
        assert name_column.nullable is False

    def test_join_code_not_nullable(self):
        """Test join_code is required."""
        jc_column = Organization.__table__.columns['join_code']
        assert jc_column.nullable is False

    def test_join_code_is_unique(self):
        """Test join_code has unique constraint."""
        jc_column = Organization.__table__.columns['join_code']
        assert jc_column.unique is True

    def test_join_code_is_indexed(self):
        """Test join_code is indexed."""
        jc_column = Organization.__table__.columns['join_code']
        assert jc_column.index is True

    def test_created_by_not_nullable(self):
        """Test created_by is required."""
        cb_column = Organization.__table__.columns['created_by']
        assert cb_column.nullable is False


class TestOrganizationForeignKeyOnDelete:
    """Test Organization foreign key cascade behaviors."""

    def test_created_by_restrict_on_delete(self):
        """Test created_by FK has RESTRICT on delete."""
        created_by_fk = None
        for fk in Organization.__table__.foreign_keys:
            if fk.parent.name == 'created_by':
                created_by_fk = fk
                break

        assert created_by_fk is not None
        assert created_by_fk.ondelete == 'RESTRICT'

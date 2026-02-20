"""
Unit tests for User model.

Tests model structure, relationships, and constraints without database.

to test an especific error (ex:test_user_instance_creation):
docker-compose exec backend pytest tests/unit/models/test_user.py::TestUserModel::test_user_instance_creation -v --tb=long     
"""

import pytest
from uuid import uuid4

from src.database.models import User


class TestUserModel:
    """Test User model structure and attributes."""

    def test_user_table_name(self):
        """Test that table name is correctly set."""
        assert User.__tablename__ == "users"

    def test_user_has_required_columns(self):
        """Test that User model has all required columns."""
        columns = [c.name for c in User.__table__.columns]

        required_columns = [
            'id',
            'email',
            'name',
            'password_hash',
            'avatar_url',
            'organization_id',
            'org_role',
            'scrum_role',
            'created_at',
            'updated_at'
        ]

        for column in required_columns:
            assert column in columns, f"Missing column: {column}"

    def test_user_foreign_keys(self):
        """Test that User has correct foreign keys."""
        foreign_keys = list(User.__table__.foreign_keys)

        fk_targets = [fk.target_fullname for fk in foreign_keys]
        assert 'organizations.id' in fk_targets

    def test_user_relationships(self):
        """Test that User has correct relationships."""
        assert hasattr(User, 'organization')
        assert hasattr(User, 'created_organizations')
        assert hasattr(User, 'standups_created')
        assert hasattr(User, 'created_blockers')
        assert hasattr(User, 'assigned_blockers')
        assert hasattr(User, 'tasks_created')
        assert hasattr(User, 'tasks_assigned')
        assert hasattr(User, 'tickets_created')
        assert hasattr(User, 'tickets_assigned')

    def test_user_instance_creation(self):
        """Test creating a User instance without database."""
        user_id = uuid4()

        user = User(
            id=user_id,
            email="test@example.com",
            name="Test User",
            password_hash="hashed_password"
        )

        assert user.id == user_id
        assert user.email == "test@example.com"
        assert user.name == "Test User"
        assert user.password_hash == "hashed_password"
        assert user.organization_id is None
        assert user.org_role is None
        assert user.scrum_role is None


class TestUserColumnTypes:
    """Test User column types and nullability."""

    def test_id_column_is_uuid(self):
        """Test id column is UUID type."""
        id_column = User.__table__.columns['id']
        assert str(id_column.type) == 'UUID'
        assert id_column.primary_key is True
        assert id_column.nullable is False

    def test_email_not_nullable(self):
        """Test email is required."""
        email_column = User.__table__.columns['email']
        assert email_column.nullable is False

    def test_email_is_unique(self):
        """Test email has unique constraint."""
        email_column = User.__table__.columns['email']
        assert email_column.unique is True

    def test_email_is_indexed(self):
        """Test email is indexed."""
        email_column = User.__table__.columns['email']
        assert email_column.index is True

    def test_name_not_nullable(self):
        """Test name is required."""
        name_column = User.__table__.columns['name']
        assert name_column.nullable is False

    def test_password_hash_not_nullable(self):
        """Test password_hash is required."""
        pw_column = User.__table__.columns['password_hash']
        assert pw_column.nullable is False

    def test_avatar_url_is_nullable(self):
        """Test avatar_url is optional."""
        avatar_column = User.__table__.columns['avatar_url']
        assert avatar_column.nullable is True

    def test_organization_id_is_nullable(self):
        """Test organization_id is optional."""
        org_column = User.__table__.columns['organization_id']
        assert org_column.nullable is True

    def test_organization_id_is_indexed(self):
        """Test organization_id is indexed."""
        org_column = User.__table__.columns['organization_id']
        assert org_column.index is True

    def test_org_role_is_nullable(self):
        """Test org_role is optional."""
        role_column = User.__table__.columns['org_role']
        assert role_column.nullable is True

    def test_scrum_role_is_nullable(self):
        """Test scrum_role is optional."""
        role_column = User.__table__.columns['scrum_role']
        assert role_column.nullable is True


class TestUserConstraints:
    """Test User check constraints."""

    def test_org_role_check_constraint_exists(self):
        """Test that org_role has a check constraint."""
        check_constraints = [
            c for c in User.__table__.constraints
            if hasattr(c, 'name') and c.name == 'ck_user_org_role'
        ]
        assert len(check_constraints) == 1

    def test_scrum_role_check_constraint_exists(self):
        """Test that scrum_role has a check constraint."""
        check_constraints = [
            c for c in User.__table__.constraints
            if hasattr(c, 'name') and c.name == 'ck_user_scrum_role'
        ]
        assert len(check_constraints) == 1


class TestUserForeignKeyOnDelete:
    """Test User foreign key cascade behaviors."""

    def test_organization_set_null_on_delete(self):
        """Test organization FK has SET NULL on delete."""
        org_fk = None
        for fk in User.__table__.foreign_keys:
            if 'organizations.id' in fk.target_fullname:
                org_fk = fk
                break

        assert org_fk is not None
        assert org_fk.ondelete == 'SET NULL'

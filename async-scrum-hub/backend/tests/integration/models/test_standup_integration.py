"""
Integration tests for Standup model.

Tests actual database operations including CRUD and relationships.
"""

import pytest
from datetime import date, timedelta
from uuid import uuid4
from sqlalchemy.exc import IntegrityError

from src.database.models import Standup, User, Organization


class TestStandupCRUD:
    """Test Standup CRUD operations with database."""

    def test_create_standup(self, test_session, sample_user, sample_organization):
        """Test creating a standup in database."""
        standup = Standup(
            id=uuid4(),
            organization_id=sample_organization.id,
            created_by=sample_user.id,
            today="Implementing standup feature",
            standup_date=date.today()
        )

        test_session.add(standup)
        test_session.commit()

        # Verify standup was created
        assert standup.id is not None
        assert standup.today == "Implementing standup feature"
        assert standup.yesterday is None
        assert standup.blocker_ids is None or standup.blocker_ids == []

    def test_read_standup(self, test_session, sample_standup):
        """Test reading a standup from database."""
        retrieved = test_session.query(Standup).filter_by(id=sample_standup.id).first()

        assert retrieved is not None
        assert retrieved.id == sample_standup.id
        assert retrieved.today == sample_standup.today

    def test_update_standup(self, test_session, sample_standup):
        """Test updating a standup."""
        sample_standup.today = "Updated standup content"
        test_session.commit()

        retrieved = test_session.query(Standup).filter_by(id=sample_standup.id).first()
        assert retrieved.today == "Updated standup content"

    def test_delete_standup(self, test_session, sample_standup):
        """Test deleting a standup."""
        standup_id = sample_standup.id

        test_session.delete(sample_standup)
        test_session.commit()

        retrieved = test_session.query(Standup).filter_by(id=standup_id).first()
        assert retrieved is None


class TestStandupRelationships:
    """Test Standup relationships with other models."""

    def test_standup_to_user_relationship(self, test_session, sample_standup, sample_user):
        """Test standup can access its creator."""
        assert sample_standup.creator is not None
        assert sample_standup.creator.id == sample_user.id
        assert sample_standup.creator.email == sample_user.email

    def test_standup_to_organization_relationship(self, test_session, sample_standup, sample_organization):
        """Test standup can access its organization."""
        assert sample_standup.organization is not None
        assert sample_standup.organization.id == sample_organization.id
        assert sample_standup.organization.name == sample_organization.name

    def test_user_to_standups_relationship(self, test_session, sample_user, sample_organization):
        """Test user can access their created standups."""
        # Create multiple standups for the user
        standup1 = Standup(
            id=uuid4(),
            organization_id=sample_organization.id,
            created_by=sample_user.id,
            today="Standup 1",
            standup_date=date.today()
        )
        standup2 = Standup(
            id=uuid4(),
            organization_id=sample_organization.id,
            created_by=sample_user.id,
            today="Standup 2",
            standup_date=date.today() - timedelta(days=1)
        )

        test_session.add_all([standup1, standup2])
        test_session.commit()

        # Refresh user to load relationships
        test_session.refresh(sample_user)

        assert len(sample_user.standups_created) == 2

    def test_organization_to_standups_relationship(self, test_session, sample_organization, sample_user):
        """Test organization can access its standups."""
        # Create standups for the organization
        standup = Standup(
            id=uuid4(),
            organization_id=sample_organization.id,
            created_by=sample_user.id,
            today="Org standup",
            standup_date=date.today()
        )

        test_session.add(standup)
        test_session.commit()

        # Refresh organization to load relationships
        test_session.refresh(sample_organization)

        assert len(sample_organization.standups) >= 1


class TestStandupConstraints:
    """Test Standup database constraints."""

    def test_unique_constraint_per_user_per_day(self, test_session, sample_user, sample_organization):
        """Test only one standup per user per day per organization."""
        today = date.today()

        # Create first standup
        standup1 = Standup(
            id=uuid4(),
            organization_id=sample_organization.id,
            created_by=sample_user.id,
            today="First standup",
            standup_date=today
        )
        test_session.add(standup1)
        test_session.commit()

        # Try to create second standup for same user/org/date
        standup2 = Standup(
            id=uuid4(),
            organization_id=sample_organization.id,
            created_by=sample_user.id,
            today="Second standup",
            standup_date=today
        )
        test_session.add(standup2)

        # This should raise IntegrityError due to unique constraint
        with pytest.raises(IntegrityError):
            test_session.commit()

    def test_can_create_standup_different_day(self, test_session, sample_user, sample_organization):
        """Test can create standup for same user on different days."""
        today = date.today()
        yesterday = today - timedelta(days=1)

        # Create standup for today
        standup1 = Standup(
            id=uuid4(),
            organization_id=sample_organization.id,
            created_by=sample_user.id,
            today="Today's standup",
            standup_date=today
        )

        # Create standup for yesterday
        standup2 = Standup(
            id=uuid4(),
            organization_id=sample_organization.id,
            created_by=sample_user.id,
            today="Yesterday's standup",
            standup_date=yesterday
        )

        test_session.add_all([standup1, standup2])
        test_session.commit()

        # Both should be created successfully
        assert standup1.id is not None
        assert standup2.id is not None


class TestStandupCascadeDelete:
    """Test cascade delete behavior."""

    def test_delete_user_deletes_standups(self, test_session, sample_organization):
        """Test deleting user cascades to delete their standups."""
        # Use a fresh user with no org (avoids RESTRICT FK from sample_organization.created_by)
        user = User(
            id=uuid4(),
            email="standalone_standup@example.com",
            name="Standalone User",
            password_hash="hash"
        )
        test_session.add(user)
        test_session.commit()

        standup = Standup(
            id=uuid4(),
            organization_id=sample_organization.id,
            created_by=user.id,
            today="Test standup",
            standup_date=date.today()
        )
        test_session.add(standup)
        test_session.commit()

        standup_id = standup.id

        test_session.delete(user)
        test_session.commit()

        retrieved = test_session.query(Standup).filter_by(id=standup_id).first()
        assert retrieved is None

    def test_delete_organization_deletes_standups(self, test_session, sample_user, sample_organization):
        """Test deleting organization cascades to delete its standups."""
        # Create standup for organization
        standup = Standup(
            id=uuid4(),
            organization_id=sample_organization.id,
            created_by=sample_user.id,
            today="Test standup",
            standup_date=date.today()
        )
        test_session.add(standup)
        test_session.commit()

        standup_id = standup.id

        # Delete organization
        test_session.delete(sample_organization)
        test_session.commit()

        # Standup should be deleted too
        retrieved = test_session.query(Standup).filter_by(id=standup_id).first()
        assert retrieved is None

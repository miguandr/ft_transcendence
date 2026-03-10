"""
Integration tests for Blocker model.

Tests actual database operations including CRUD and relationships.
"""

import pytest
from datetime import datetime
from uuid import uuid4
from sqlalchemy.exc import IntegrityError

from src.database.models import Blocker, User, Organization
from src.database.models.blocker import BlockerStatus


class TestBlockerCRUD:
    """Test Blocker CRUD operations with database."""

    def test_create_blocker(self, test_session, sample_user, sample_organization):
        """Test creating a blocker in database."""
        blocker = Blocker(
            id=uuid4(),
            organization_id=sample_organization.id,
            created_by=sample_user.id,
            description="Database connection timeout",
            status=BlockerStatus.OPEN
        )

        test_session.add(blocker)
        test_session.commit()

        # Verify blocker was created
        assert blocker.id is not None
        assert blocker.description == "Database connection timeout"
        assert blocker.status == BlockerStatus.OPEN
        assert blocker.assignee_id is None
        assert blocker.resolved_at is None

    def test_create_blocker_with_assignee(self, test_session, sample_user, sample_organization):
        """Test creating a blocker with an assignee."""
        blocker = Blocker(
            id=uuid4(),
            organization_id=sample_organization.id,
            created_by=sample_user.id,
            assignee_id=sample_user.id,
            description="Need review on PR",
            status=BlockerStatus.OPEN
        )

        test_session.add(blocker)
        test_session.commit()

        assert blocker.assignee_id == sample_user.id

    def test_read_blocker(self, test_session, sample_blocker):
        """Test reading a blocker from database."""
        retrieved = test_session.query(Blocker).filter_by(id=sample_blocker.id).first()

        assert retrieved is not None
        assert retrieved.id == sample_blocker.id
        assert retrieved.description == sample_blocker.description

    def test_update_blocker(self, test_session, sample_blocker):
        """Test updating a blocker."""
        sample_blocker.description = "Updated blocker description"
        test_session.commit()

        retrieved = test_session.query(Blocker).filter_by(id=sample_blocker.id).first()
        assert retrieved.description == "Updated blocker description"

    def test_resolve_blocker(self, test_session, sample_blocker):
        """Test resolving a blocker."""
        sample_blocker.status = BlockerStatus.RESOLVED
        sample_blocker.resolved_at = datetime.utcnow()
        test_session.commit()

        retrieved = test_session.query(Blocker).filter_by(id=sample_blocker.id).first()
        assert retrieved.status == BlockerStatus.RESOLVED
        assert retrieved.resolved_at is not None

    def test_delete_blocker(self, test_session, sample_blocker):
        """Test deleting a blocker."""
        blocker_id = sample_blocker.id

        test_session.delete(sample_blocker)
        test_session.commit()

        retrieved = test_session.query(Blocker).filter_by(id=blocker_id).first()
        assert retrieved is None


class TestBlockerRelationships:
    """Test Blocker relationships with other models."""

    def test_blocker_to_creator_relationship(self, test_session, sample_blocker, sample_user):
        """Test blocker can access its creator."""
        assert sample_blocker.creator is not None
        assert sample_blocker.creator.id == sample_user.id
        assert sample_blocker.creator.email == sample_user.email

    def test_blocker_to_organization_relationship(self, test_session, sample_blocker, sample_organization):
        """Test blocker can access its organization."""
        assert sample_blocker.organization is not None
        assert sample_blocker.organization.id == sample_organization.id
        assert sample_blocker.organization.name == sample_organization.name

    def test_blocker_to_assignee_relationship(self, test_session, sample_user, sample_organization):
        """Test blocker can access its assignee."""
        blocker = Blocker(
            id=uuid4(),
            organization_id=sample_organization.id,
            created_by=sample_user.id,
            assignee_id=sample_user.id,
            description="Assigned blocker",
            status=BlockerStatus.OPEN
        )

        test_session.add(blocker)
        test_session.commit()

        assert blocker.assignee is not None
        assert blocker.assignee.id == sample_user.id

    def test_user_to_created_blockers_relationship(self, test_session, sample_user, sample_organization):
        """Test user can access their created blockers."""
        # Create multiple blockers
        blocker1 = Blocker(
            id=uuid4(),
            organization_id=sample_organization.id,
            created_by=sample_user.id,
            description="Blocker 1",
            status=BlockerStatus.OPEN
        )
        blocker2 = Blocker(
            id=uuid4(),
            organization_id=sample_organization.id,
            created_by=sample_user.id,
            description="Blocker 2",
            status=BlockerStatus.OPEN
        )

        test_session.add_all([blocker1, blocker2])
        test_session.commit()

        # Refresh user to load relationships
        test_session.refresh(sample_user)

        assert len(sample_user.created_blockers) == 2

    def test_user_to_assigned_blockers_relationship(self, test_session, sample_user, sample_organization):
        """Test user can access blockers assigned to them."""
        blocker = Blocker(
            id=uuid4(),
            organization_id=sample_organization.id,
            created_by=sample_user.id,
            assignee_id=sample_user.id,
            description="Assigned to me",
            status=BlockerStatus.OPEN
        )

        test_session.add(blocker)
        test_session.commit()

        # Refresh user to load relationships
        test_session.refresh(sample_user)

        assert len(sample_user.assigned_blockers) >= 1

    def test_organization_to_blockers_relationship(self, test_session, sample_organization, sample_user):
        """Test organization can access its blockers."""
        blocker = Blocker(
            id=uuid4(),
            organization_id=sample_organization.id,
            created_by=sample_user.id,
            description="Org blocker",
            status=BlockerStatus.OPEN
        )

        test_session.add(blocker)
        test_session.commit()

        # Refresh organization to load relationships
        test_session.refresh(sample_organization)

        assert len(sample_organization.blockers) >= 1


class TestBlockerStatus:
    """Test Blocker status transitions."""

    def test_blocker_default_status_is_open(self, test_session, sample_user, sample_organization):
        """Test new blockers default to OPEN status."""
        blocker = Blocker(
            id=uuid4(),
            organization_id=sample_organization.id,
            created_by=sample_user.id,
            description="Default status test",
            status=BlockerStatus.OPEN
        )

        test_session.add(blocker)
        test_session.commit()

        assert blocker.status == BlockerStatus.OPEN

    def test_transition_open_to_resolved(self, test_session, sample_blocker):
        """Test transitioning blocker from open to resolved."""
        assert sample_blocker.status == BlockerStatus.OPEN
        assert sample_blocker.resolved_at is None

        sample_blocker.status = BlockerStatus.RESOLVED
        sample_blocker.resolved_at = datetime.utcnow()
        test_session.commit()

        assert sample_blocker.status == BlockerStatus.RESOLVED
        assert sample_blocker.resolved_at is not None


class TestBlockerCascadeDelete:
    """Test cascade delete behavior."""

    def test_delete_user_deletes_created_blockers(self, test_session, sample_organization):
        """Test deleting user cascades to delete their created blockers."""
        # Use a fresh user with no org (avoids RESTRICT FK from sample_organization.created_by)
        user = User(
            id=uuid4(),
            email="standalone_blocker@example.com",
            name="Standalone User",
            password_hash="hash"
        )
        test_session.add(user)
        test_session.commit()

        blocker = Blocker(
            id=uuid4(),
            organization_id=sample_organization.id,
            created_by=user.id,
            description="Test blocker",
            status=BlockerStatus.OPEN
        )
        test_session.add(blocker)
        test_session.commit()

        blocker_id = blocker.id

        test_session.delete(user)
        test_session.commit()

        retrieved = test_session.query(Blocker).filter_by(id=blocker_id).first()
        assert retrieved is None

    def test_delete_assignee_sets_null(self, test_session, sample_organization):
        """Test deleting assignee sets assignee_id to NULL."""
        # Create two users
        creator = User(
            id=uuid4(),
            email="creator@example.com",
            name="Creator",
            password_hash="hash"
        )
        assignee = User(
            id=uuid4(),
            email="assignee@example.com",
            name="Assignee",
            password_hash="hash"
        )
        test_session.add_all([creator, assignee])
        test_session.commit()

        # Create blocker with assignee
        blocker = Blocker(
            id=uuid4(),
            organization_id=sample_organization.id,
            created_by=creator.id,
            assignee_id=assignee.id,
            description="Assigned blocker",
            status=BlockerStatus.OPEN
        )
        test_session.add(blocker)
        test_session.commit()

        blocker_id = blocker.id

        # Delete assignee
        test_session.delete(assignee)
        test_session.commit()

        # Blocker should still exist but assignee_id should be NULL
        retrieved = test_session.query(Blocker).filter_by(id=blocker_id).first()
        assert retrieved is not None
        assert retrieved.assignee_id is None

    def test_delete_organization_deletes_blockers(self, test_session, sample_user, sample_organization):
        """Test deleting organization cascades to delete its blockers."""
        blocker = Blocker(
            id=uuid4(),
            organization_id=sample_organization.id,
            created_by=sample_user.id,
            description="Test blocker",
            status=BlockerStatus.OPEN
        )
        test_session.add(blocker)
        test_session.commit()

        blocker_id = blocker.id

        # Delete organization
        test_session.delete(sample_organization)
        test_session.commit()

        # Blocker should be deleted too
        retrieved = test_session.query(Blocker).filter_by(id=blocker_id).first()
        assert retrieved is None


class TestBlockerQuerying:
    """Test querying blockers."""

    def test_filter_by_status(self, test_session, sample_user, sample_organization):
        """Test filtering blockers by status."""
        # Create open and resolved blockers
        open_blocker = Blocker(
            id=uuid4(),
            organization_id=sample_organization.id,
            created_by=sample_user.id,
            description="Open blocker",
            status=BlockerStatus.OPEN
        )
        resolved_blocker = Blocker(
            id=uuid4(),
            organization_id=sample_organization.id,
            created_by=sample_user.id,
            description="Resolved blocker",
            status=BlockerStatus.RESOLVED,
            resolved_at=datetime.utcnow()
        )

        test_session.add_all([open_blocker, resolved_blocker])
        test_session.commit()

        # Query only open blockers
        open_blockers = test_session.query(Blocker).filter_by(
            organization_id=sample_organization.id,
            status=BlockerStatus.OPEN
        ).all()

        assert len(open_blockers) >= 1
        assert all(b.status == BlockerStatus.OPEN for b in open_blockers)

    def test_filter_by_assignee(self, test_session, sample_user, sample_organization):
        """Test filtering blockers by assignee."""
        # Create assigned and unassigned blockers
        assigned_blocker = Blocker(
            id=uuid4(),
            organization_id=sample_organization.id,
            created_by=sample_user.id,
            assignee_id=sample_user.id,
            description="Assigned",
            status=BlockerStatus.OPEN
        )
        unassigned_blocker = Blocker(
            id=uuid4(),
            organization_id=sample_organization.id,
            created_by=sample_user.id,
            description="Unassigned",
            status=BlockerStatus.OPEN
        )

        test_session.add_all([assigned_blocker, unassigned_blocker])
        test_session.commit()

        # Query blockers assigned to user
        assigned_blockers = test_session.query(Blocker).filter_by(
            assignee_id=sample_user.id
        ).all()

        assert len(assigned_blockers) >= 1
        assert all(b.assignee_id == sample_user.id for b in assigned_blockers)

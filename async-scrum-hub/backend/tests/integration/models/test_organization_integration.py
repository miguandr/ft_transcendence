"""
Integration tests for Organization model.

Tests actual database operations including CRUD and relationships.

to test an especific error (ex:test_create_organization):
docker-compose exec backend pytest tests/integration/models/test_organization_integration.py::TestOrganizationCRUD::test_create_organization -v --tb=long
"""

import pytest
from uuid import uuid4
from sqlalchemy.exc import IntegrityError

from src.database.models import Organization, User, Standup, Blocker
from src.database.models.blocker import BlockerStatus


class TestOrganizationCRUD:
    """Test Organization CRUD operations with database."""

    def test_create_organization(self, test_session, sample_user):
        """Test creating an organization in database."""
        org = Organization(
            id=uuid4(),
            name="New Organization",
            join_code="NEW001",
            created_by=sample_user.id
        )

        test_session.add(org)
        test_session.commit()

        assert org.id is not None
        assert org.name == "New Organization"
        assert org.join_code == "NEW001"
        assert org.created_by == sample_user.id

    def test_read_organization(self, test_session, sample_organization):
        """Test reading an organization from database."""
        retrieved = test_session.query(Organization).filter_by(id=sample_organization.id).first()

        assert retrieved is not None
        assert retrieved.id == sample_organization.id
        assert retrieved.name == sample_organization.name
        assert retrieved.join_code == sample_organization.join_code

    def test_update_organization(self, test_session, sample_organization):
        """Test updating an organization."""
        sample_organization.name = "Updated Organization"
        test_session.commit()

        retrieved = test_session.query(Organization).filter_by(id=sample_organization.id).first()
        assert retrieved.name == "Updated Organization"

    def test_delete_organization(self, test_session, sample_user):
        """Test deleting an organization."""
        org = Organization(
            id=uuid4(),
            name="Deletable Org",
            join_code="DEL001",
            created_by=sample_user.id
        )
        test_session.add(org)
        test_session.commit()

        org_id = org.id

        test_session.delete(org)
        test_session.commit()

        retrieved = test_session.query(Organization).filter_by(id=org_id).first()
        assert retrieved is None


class TestOrganizationRelationships:
    """Test Organization relationships with other models."""

    def test_organization_to_creator_relationship(self, test_session, sample_organization, sample_user):
        """Test organization can access its creator."""
        assert sample_organization.creator is not None
        assert sample_organization.creator.id == sample_user.id
        assert sample_organization.creator.email == sample_user.email

    def test_organization_to_users_relationship(self, test_session, sample_organization):
        """Test organization can access its members."""
        user1 = User(
            id=uuid4(),
            email="member1@example.com",
            name="Member One",
            password_hash="hash",
            organization_id=sample_organization.id,
            org_role="member",
            scrum_role="developer"
        )
        user2 = User(
            id=uuid4(),
            email="member2@example.com",
            name="Member Two",
            password_hash="hash",
            organization_id=sample_organization.id,
            org_role="member",
            scrum_role="developer"
        )

        test_session.add_all([user1, user2])
        test_session.commit()
        test_session.refresh(sample_organization)

        assert len(sample_organization.users) == 2

    def test_organization_to_standups_relationship(self, test_session, sample_user, sample_organization):
        """Test organization can access its standups."""
        from datetime import date

        standup = Standup(
            id=uuid4(),
            organization_id=sample_organization.id,
            created_by=sample_user.id,
            today="Working on tests",
            standup_date=date.today()
        )

        test_session.add(standup)
        test_session.commit()
        test_session.refresh(sample_organization)

        assert len(sample_organization.standups) == 1

    def test_organization_to_blockers_relationship(self, test_session, sample_user, sample_organization):
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
        test_session.refresh(sample_organization)

        assert len(sample_organization.blockers) == 1


class TestOrganizationConstraints:
    """Test Organization constraints."""

    def test_unique_join_code_constraint(self, test_session, sample_user):
        """Test that duplicate join codes are rejected."""
        org1 = Organization(
            id=uuid4(),
            name="Org One",
            join_code="DUPE01",
            created_by=sample_user.id
        )
        test_session.add(org1)
        test_session.commit()

        org2 = Organization(
            id=uuid4(),
            name="Org Two",
            join_code="DUPE01",
            created_by=sample_user.id
        )
        test_session.add(org2)

        with pytest.raises(IntegrityError):
            test_session.commit()

    def test_restrict_delete_creator(self, test_session):
        """Test that deleting a user who created an organization is restricted."""
        user = User(
            id=uuid4(),
            email="creator@example.com",
            name="Creator",
            password_hash="hash"
        )
        test_session.add(user)
        test_session.commit()

        org = Organization(
            id=uuid4(),
            name="Protected Org",
            join_code="PROT01",
            created_by=user.id
        )
        test_session.add(org)
        test_session.commit()

        with pytest.raises(IntegrityError):
            test_session.delete(user)
            test_session.commit()


class TestOrganizationCascadeDelete:
    """Test cascade delete behavior."""

    def test_delete_organization_deletes_standups(self, test_session, sample_user):
        """Test deleting organization cascades to delete its standups."""
        from datetime import date

        org = Organization(
            id=uuid4(),
            name="Cascade Org",
            join_code="CASC01",
            created_by=sample_user.id
        )
        test_session.add(org)
        test_session.commit()

        standup = Standup(
            id=uuid4(),
            organization_id=org.id,
            created_by=sample_user.id,
            today="Test standup",
            standup_date=date.today()
        )
        test_session.add(standup)
        test_session.commit()

        standup_id = standup.id

        test_session.delete(org)
        test_session.commit()

        retrieved = test_session.query(Standup).filter_by(id=standup_id).first()
        assert retrieved is None

    def test_delete_organization_deletes_blockers(self, test_session, sample_user):
        """Test deleting organization cascades to delete its blockers."""
        org = Organization(
            id=uuid4(),
            name="Cascade Org",
            join_code="CASC02",
            created_by=sample_user.id
        )
        test_session.add(org)
        test_session.commit()

        blocker = Blocker(
            id=uuid4(),
            organization_id=org.id,
            created_by=sample_user.id,
            description="Cascade blocker",
            status=BlockerStatus.OPEN
        )
        test_session.add(blocker)
        test_session.commit()

        blocker_id = blocker.id

        test_session.delete(org)
        test_session.commit()

        retrieved = test_session.query(Blocker).filter_by(id=blocker_id).first()
        assert retrieved is None

    def test_delete_organization_sets_user_org_null(self, test_session):
        """Test deleting organization sets users' organization_id to NULL."""
        creator = User(
            id=uuid4(),
            email="creator@example.com",
            name="Creator",
            password_hash="hash"
        )
        test_session.add(creator)
        test_session.commit()

        org = Organization(
            id=uuid4(),
            name="Deletable Org",
            join_code="DEL002",
            created_by=creator.id
        )
        test_session.add(org)
        test_session.commit()

        member = User(
            id=uuid4(),
            email="member@example.com",
            name="Member",
            password_hash="hash",
            organization_id=org.id
        )
        test_session.add(member)
        test_session.commit()

        member_id = member.id

        test_session.delete(org)
        test_session.commit()

        retrieved = test_session.query(User).filter_by(id=member_id).first()
        assert retrieved is not None
        assert retrieved.organization_id is None


class TestOrganizationQuerying:
    """Test querying organizations."""

    def test_filter_by_join_code(self, test_session, sample_organization):
        """Test filtering organizations by join code."""
        retrieved = test_session.query(Organization).filter_by(
            join_code=sample_organization.join_code
        ).first()

        assert retrieved is not None
        assert retrieved.id == sample_organization.id

    def test_filter_by_creator(self, test_session, sample_user):
        """Test filtering organizations by creator."""
        org1 = Organization(
            id=uuid4(),
            name="Org One",
            join_code="QRY001",
            created_by=sample_user.id
        )
        org2 = Organization(
            id=uuid4(),
            name="Org Two",
            join_code="QRY002",
            created_by=sample_user.id
        )
        test_session.add_all([org1, org2])
        test_session.commit()

        orgs = test_session.query(Organization).filter_by(
            created_by=sample_user.id
        ).all()

        assert len(orgs) >= 2

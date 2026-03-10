"""
Integration tests for User model.

Tests actual database operations including CRUD and relationships.
"""

import pytest
from uuid import uuid4
from sqlalchemy.exc import IntegrityError

from src.database.models import User, Organization, Standup, Blocker
from src.database.models.blocker import BlockerStatus
from src.database.models import Ticket, Task
from src.database.models.enums import TicketStatus, TaskStatus, Priority


class TestUserCRUD:
    """Test User CRUD operations with database."""

    def test_create_user(self, test_session):
        """Test creating a user in database."""
        user = User(
            id=uuid4(),
            email="newuser@example.com",
            name="New User",
            password_hash="hashed_password"
        )

        test_session.add(user)
        test_session.commit()

        assert user.id is not None
        assert user.email == "newuser@example.com"
        assert user.name == "New User"
        assert user.organization_id is None
        assert user.org_role is None
        assert user.scrum_role is None

    def test_create_user_with_roles(self, test_session):
        """Test creating a user with organization and scrum roles."""
        user = User(
            id=uuid4(),
            email="roleduser@example.com",
            name="Roled User",
            password_hash="hashed_password",
            org_role="member",
            scrum_role="developer"
        )

        test_session.add(user)
        test_session.commit()

        assert user.org_role == "member"
        assert user.scrum_role == "developer"

    def test_read_user(self, test_session, sample_user):
        """Test reading a user from database."""
        retrieved = test_session.query(User).filter_by(id=sample_user.id).first()

        assert retrieved is not None
        assert retrieved.id == sample_user.id
        assert retrieved.email == sample_user.email
        assert retrieved.name == sample_user.name

    def test_update_user(self, test_session, sample_user):
        """Test updating a user."""
        sample_user.name = "Updated Name"
        test_session.commit()

        retrieved = test_session.query(User).filter_by(id=sample_user.id).first()
        assert retrieved.name == "Updated Name"

    def test_delete_user(self, test_session):
        """Test deleting a user."""
        user = User(
            id=uuid4(),
            email="deleteme@example.com",
            name="Delete Me",
            password_hash="hashed_password"
        )
        test_session.add(user)
        test_session.commit()

        user_id = user.id

        test_session.delete(user)
        test_session.commit()

        retrieved = test_session.query(User).filter_by(id=user_id).first()
        assert retrieved is None


class TestUserRelationships:
    """Test User relationships with other models."""

    def test_user_to_organization_relationship(self, test_session, sample_user, sample_organization):
        """Test user can access their organization."""
        sample_user.organization_id = sample_organization.id
        test_session.commit()
        test_session.refresh(sample_user)

        assert sample_user.organization is not None
        assert sample_user.organization.id == sample_organization.id
        assert sample_user.organization.name == sample_organization.name

    def test_user_to_created_organizations_relationship(self, test_session, sample_user):
        """Test user can access organizations they created."""
        org1 = Organization(
            id=uuid4(),
            name="Org One",
            join_code="ORG001",
            created_by=sample_user.id
        )
        org2 = Organization(
            id=uuid4(),
            name="Org Two",
            join_code="ORG002",
            created_by=sample_user.id
        )

        test_session.add_all([org1, org2])
        test_session.commit()
        test_session.refresh(sample_user)

        assert len(sample_user.created_organizations) == 2

    def test_user_to_standups_created_relationship(self, test_session, sample_user, sample_organization):
        """Test user can access their created standups."""
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
        test_session.refresh(sample_user)

        assert len(sample_user.standups_created) == 1
        assert sample_user.standups_created[0].today == "Working on tests"

    def test_user_to_created_blockers_relationship(self, test_session, sample_user, sample_organization):
        """Test user can access their created blockers."""
        blocker = Blocker(
            id=uuid4(),
            organization_id=sample_organization.id,
            created_by=sample_user.id,
            description="Test blocker",
            status=BlockerStatus.OPEN
        )

        test_session.add(blocker)
        test_session.commit()
        test_session.refresh(sample_user)

        assert len(sample_user.created_blockers) == 1
        assert sample_user.created_blockers[0].description == "Test blocker"

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
        test_session.refresh(sample_user)

        assert len(sample_user.assigned_blockers) == 1
        assert sample_user.assigned_blockers[0].description == "Assigned to me"

    def test_user_to_tickets_created_relationship(self, test_session, sample_user, sample_organization):
        """Test user can access tickets they created."""
        ticket = Ticket(
            id=uuid4(),
            title="Test Ticket",
            organization_id=sample_organization.id,
            created_by=sample_user.id,
            status=TicketStatus.TODO,
            priority=Priority.MEDIUM
        )

        test_session.add(ticket)
        test_session.commit()
        test_session.refresh(sample_user)

        assert len(sample_user.tickets_created) == 1
        assert sample_user.tickets_created[0].title == "Test Ticket"

    def test_user_to_tickets_assigned_relationship(self, test_session, sample_user, sample_organization):
        """Test user can access tickets assigned to them."""
        ticket = Ticket(
            id=uuid4(),
            title="Assigned Ticket",
            organization_id=sample_organization.id,
            created_by=sample_user.id,
            assignee_id=sample_user.id,
            status=TicketStatus.TODO,
            priority=Priority.MEDIUM
        )

        test_session.add(ticket)
        test_session.commit()
        test_session.refresh(sample_user)

        assert len(sample_user.tickets_assigned) == 1
        assert sample_user.tickets_assigned[0].title == "Assigned Ticket"

    def test_user_to_tasks_created_relationship(self, test_session, sample_user, sample_organization):
        """Test user can access tasks they created."""
        ticket = Ticket(
            id=uuid4(),
            title="Parent Ticket",
            organization_id=sample_organization.id,
            created_by=sample_user.id,
            status=TicketStatus.TODO,
            priority=Priority.MEDIUM
        )
        test_session.add(ticket)
        test_session.commit()

        task = Task(
            id=uuid4(),
            title="Test Task",
            ticket_id=ticket.id,
            organization_id=sample_organization.id,
            created_by=sample_user.id,
            status=TaskStatus.IN_PROGRESS
        )

        test_session.add(task)
        test_session.commit()
        test_session.refresh(sample_user)

        assert len(sample_user.tasks_created) == 1
        assert sample_user.tasks_created[0].title == "Test Task"

    def test_user_to_tasks_assigned_relationship(self, test_session, sample_user, sample_organization):
        """Test user can access tasks assigned to them."""
        ticket = Ticket(
            id=uuid4(),
            title="Parent Ticket",
            organization_id=sample_organization.id,
            created_by=sample_user.id,
            status=TicketStatus.TODO,
            priority=Priority.MEDIUM
        )
        test_session.add(ticket)
        test_session.commit()

        task = Task(
            id=uuid4(),
            title="Assigned Task",
            ticket_id=ticket.id,
            organization_id=sample_organization.id,
            created_by=sample_user.id,
            assignee_id=sample_user.id,
            status=TaskStatus.IN_PROGRESS
        )

        test_session.add(task)
        test_session.commit()
        test_session.refresh(sample_user)

        assert len(sample_user.tasks_assigned) == 1
        assert sample_user.tasks_assigned[0].title == "Assigned Task"


class TestUserConstraints:
    """Test User constraints."""

    def test_unique_email_constraint(self, test_session):
        """Test that duplicate emails are rejected."""
        user1 = User(
            id=uuid4(),
            email="duplicate@example.com",
            name="User One",
            password_hash="hashed_password"
        )
        test_session.add(user1)
        test_session.commit()

        user2 = User(
            id=uuid4(),
            email="duplicate@example.com",
            name="User Two",
            password_hash="hashed_password"
        )
        test_session.add(user2)

        with pytest.raises(IntegrityError):
            test_session.commit()

    def test_valid_org_role_constraint(self, test_session):
        """Test that invalid org_role values are rejected."""
        user = User(
            id=uuid4(),
            email="badrole@example.com",
            name="Bad Role",
            password_hash="hashed_password",
            org_role="invalid_role"
        )
        test_session.add(user)

        with pytest.raises(IntegrityError):
            test_session.commit()

    def test_valid_scrum_role_constraint(self, test_session):
        """Test that invalid scrum_role values are rejected."""
        user = User(
            id=uuid4(),
            email="badrole2@example.com",
            name="Bad Scrum Role",
            password_hash="hashed_password",
            scrum_role="invalid_role"
        )
        test_session.add(user)

        with pytest.raises(IntegrityError):
            test_session.commit()


class TestUserCascadeDelete:
    """Test cascade delete behavior."""

    def test_delete_user_deletes_created_standups(self, test_session):
        """Test deleting user cascades to delete their standups."""
        from datetime import date

        user = User(
            id=uuid4(),
            email="cascade_standup@example.com",
            name="Cascade User",
            password_hash="hashed_password"
        )
        test_session.add(user)
        test_session.commit()

        org = Organization(
            id=uuid4(),
            name="Cascade Org",
            join_code="CASC01",
            created_by=user.id
        )
        test_session.add(org)
        test_session.commit()

        standup = Standup(
            id=uuid4(),
            organization_id=org.id,
            created_by=user.id,
            today="Test standup",
            standup_date=date.today()
        )
        test_session.add(standup)
        test_session.commit()

        standup_id = standup.id

        # Must delete org first (org.created_by RESTRICT prevents deleting user)
        test_session.delete(org)
        test_session.commit()

        test_session.delete(user)
        test_session.commit()

        retrieved = test_session.query(Standup).filter_by(id=standup_id).first()
        assert retrieved is None

    def test_delete_user_deletes_created_blockers(self, test_session):
        """Test deleting user cascades to delete their created blockers."""
        user = User(
            id=uuid4(),
            email="cascade_blocker@example.com",
            name="Cascade User",
            password_hash="hashed_password"
        )
        test_session.add(user)
        test_session.commit()

        org = Organization(
            id=uuid4(),
            name="Cascade Org",
            join_code="CASC02",
            created_by=user.id
        )
        test_session.add(org)
        test_session.commit()

        blocker = Blocker(
            id=uuid4(),
            organization_id=org.id,
            created_by=user.id,
            description="Cascade test blocker",
            status=BlockerStatus.OPEN
        )
        test_session.add(blocker)
        test_session.commit()

        blocker_id = blocker.id

        # Must delete org first (org.created_by RESTRICT prevents deleting user)
        test_session.delete(org)
        test_session.commit()

        test_session.delete(user)
        test_session.commit()

        retrieved = test_session.query(Blocker).filter_by(id=blocker_id).first()
        assert retrieved is None

    def test_delete_organization_sets_user_org_null(self, test_session):
        """Test deleting organization sets user's organization_id to NULL."""
        user = User(
            id=uuid4(),
            email="orgset@example.com",
            name="Org User",
            password_hash="hashed_password"
        )
        test_session.add(user)
        test_session.commit()

        org = Organization(
            id=uuid4(),
            name="Deletable Org",
            join_code="DEL001",
            created_by=user.id
        )
        test_session.add(org)
        test_session.commit()

        user.organization_id = org.id
        test_session.commit()

        test_session.delete(org)
        test_session.commit()

        test_session.refresh(user)
        assert user.organization_id is None


class TestUserQuerying:
    """Test querying users."""

    def test_filter_by_email(self, test_session, sample_user):
        """Test filtering users by email."""
        retrieved = test_session.query(User).filter_by(email="test@example.com").first()

        assert retrieved is not None
        assert retrieved.id == sample_user.id

    def test_filter_by_org_role(self, test_session):
        """Test filtering users by organization role."""
        admin = User(
            id=uuid4(),
            email="admin@example.com",
            name="Admin User",
            password_hash="hashed_password",
            org_role="admin",
            scrum_role="scrum_master"
        )
        member = User(
            id=uuid4(),
            email="member@example.com",
            name="Member User",
            password_hash="hashed_password",
            org_role="member",
            scrum_role="developer"
        )
        test_session.add_all([admin, member])
        test_session.commit()

        admins = test_session.query(User).filter_by(org_role="admin").all()
        assert len(admins) >= 1
        assert all(u.org_role == "admin" for u in admins)

    def test_filter_by_scrum_role(self, test_session):
        """Test filtering users by scrum role."""
        dev = User(
            id=uuid4(),
            email="dev@example.com",
            name="Dev User",
            password_hash="hashed_password",
            org_role="member",
            scrum_role="developer"
        )
        sm = User(
            id=uuid4(),
            email="sm@example.com",
            name="SM User",
            password_hash="hashed_password",
            org_role="member",
            scrum_role="scrum_master"
        )
        test_session.add_all([dev, sm])
        test_session.commit()

        developers = test_session.query(User).filter_by(scrum_role="developer").all()
        assert len(developers) >= 1
        assert all(u.scrum_role == "developer" for u in developers)

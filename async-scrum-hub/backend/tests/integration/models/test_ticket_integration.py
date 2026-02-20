"""
Integration tests for Ticket model.

Tests actual database operations including CRUD and relationships.

to test a specific test (ex: test_create_ticket):
docker-compose exec backend pytest tests/integration/models/test_ticket_integration.py::TestTicketCRUD::test_create_ticket -v --tb=long
"""

import pytest
from uuid import uuid4
from sqlalchemy.exc import IntegrityError

from src.database.models import Ticket, Task, User, Organization, Blocker
from src.database.models.blocker import BlockerStatus
from src.database.models.enums import TicketStatus, TaskStatus, Priority


class TestTicketCRUD:
    """Test Ticket CRUD operations with database."""

    def test_create_ticket(self, test_session, sample_user, sample_organization):
        """Test creating a ticket in the database."""
        ticket = Ticket(
            id=uuid4(),
            title="Fix login bug",
            organization_id=sample_organization.id,
            created_by=sample_user.id,
            status=TicketStatus.TODO,
            priority=Priority.HIGH
        )

        test_session.add(ticket)
        test_session.commit()

        assert ticket.id is not None
        assert ticket.title == "Fix login bug"
        assert ticket.status == TicketStatus.TODO
        assert ticket.priority == Priority.HIGH
        assert ticket.description is None
        assert ticket.assignee_id is None

    def test_create_ticket_with_description_and_assignee(self, test_session, sample_user, sample_organization):
        """Test creating a ticket with optional fields."""
        ticket = Ticket(
            id=uuid4(),
            title="Improve dashboard",
            description="Add charts and filters to the dashboard",
            organization_id=sample_organization.id,
            created_by=sample_user.id,
            assignee_id=sample_user.id,
            status=TicketStatus.IN_PROGRESS,
            priority=Priority.MEDIUM
        )

        test_session.add(ticket)
        test_session.commit()

        assert ticket.description == "Add charts and filters to the dashboard"
        assert ticket.assignee_id == sample_user.id
        assert ticket.status == TicketStatus.IN_PROGRESS

    def test_read_ticket(self, test_session, sample_ticket):
        """Test reading a ticket from the database."""
        retrieved = test_session.query(Ticket).filter_by(id=sample_ticket.id).first()

        assert retrieved is not None
        assert retrieved.id == sample_ticket.id
        assert retrieved.title == sample_ticket.title
        assert retrieved.status == sample_ticket.status

    def test_update_ticket(self, test_session, sample_ticket):
        """Test updating a ticket."""
        sample_ticket.title = "Updated Title"
        sample_ticket.status = TicketStatus.IN_PROGRESS
        test_session.commit()

        retrieved = test_session.query(Ticket).filter_by(id=sample_ticket.id).first()
        assert retrieved.title == "Updated Title"
        assert retrieved.status == TicketStatus.IN_PROGRESS

    def test_delete_ticket(self, test_session, sample_user, sample_organization):
        """Test deleting a ticket."""
        ticket = Ticket(
            id=uuid4(),
            title="To be deleted",
            organization_id=sample_organization.id,
            created_by=sample_user.id,
            status=TicketStatus.TODO,
            priority=Priority.LOW
        )
        test_session.add(ticket)
        test_session.commit()

        ticket_id = ticket.id
        test_session.delete(ticket)
        test_session.commit()

        retrieved = test_session.query(Ticket).filter_by(id=ticket_id).first()
        assert retrieved is None


class TestTicketRelationships:
    """Test Ticket relationships with other models."""

    def test_ticket_to_creator_relationship(self, test_session, sample_ticket, sample_user):
        """Test ticket can access its creator."""
        assert sample_ticket.creator is not None
        assert sample_ticket.creator.id == sample_user.id
        assert sample_ticket.creator.email == sample_user.email

    def test_ticket_to_organization_relationship(self, test_session, sample_ticket, sample_organization):
        """Test ticket can access its organization."""
        assert sample_ticket.organization is not None
        assert sample_ticket.organization.id == sample_organization.id
        assert sample_ticket.organization.name == sample_organization.name

    def test_ticket_to_assignee_relationship(self, test_session, sample_user, sample_organization):
        """Test ticket can access its assignee."""
        ticket = Ticket(
            id=uuid4(),
            title="Assigned ticket",
            organization_id=sample_organization.id,
            created_by=sample_user.id,
            assignee_id=sample_user.id,
            status=TicketStatus.TODO,
            priority=Priority.MEDIUM
        )
        test_session.add(ticket)
        test_session.commit()

        assert ticket.assignee is not None
        assert ticket.assignee.id == sample_user.id

    def test_ticket_to_tasks_relationship(self, test_session, sample_ticket, sample_user, sample_organization):
        """Test ticket can access its tasks."""
        task1 = Task(
            id=uuid4(),
            title="Task One",
            ticket_id=sample_ticket.id,
            organization_id=sample_organization.id,
            created_by=sample_user.id,
            status=TaskStatus.IN_PROGRESS
        )
        task2 = Task(
            id=uuid4(),
            title="Task Two",
            ticket_id=sample_ticket.id,
            organization_id=sample_organization.id,
            created_by=sample_user.id,
            status=TaskStatus.IN_PROGRESS
        )

        test_session.add_all([task1, task2])
        test_session.commit()
        test_session.refresh(sample_ticket)

        assert len(sample_ticket.tasks) == 2

    def test_ticket_to_blockers_relationship(self, test_session, sample_ticket, sample_user, sample_organization):
        """Test ticket can access its blockers."""
        blocker = Blocker(
            id=uuid4(),
            organization_id=sample_organization.id,
            created_by=sample_user.id,
            description="Blocker linked to ticket",
            status=BlockerStatus.OPEN
        )
        test_session.add(blocker)
        test_session.commit()

        # Link blocker to ticket via ticket_id on Blocker
        blocker.ticket_id = sample_ticket.id
        test_session.commit()
        test_session.refresh(sample_ticket)

        assert len(sample_ticket.blockers) == 1
        assert sample_ticket.blockers[0].description == "Blocker linked to ticket"


class TestTicketCascadeDelete:
    """Test cascade delete behavior."""

    def test_delete_creator_deletes_ticket(self, test_session, sample_organization):
        """Test deleting the creator cascades to delete the ticket."""
        creator = User(
            id=uuid4(),
            email="ticket_creator@example.com",
            name="Ticket Creator",
            password_hash="hash"
        )
        test_session.add(creator)
        test_session.commit()

        ticket = Ticket(
            id=uuid4(),
            title="Orphan Ticket",
            organization_id=sample_organization.id,
            created_by=creator.id,
            status=TicketStatus.TODO,
            priority=Priority.LOW
        )
        test_session.add(ticket)
        test_session.commit()

        ticket_id = ticket.id

        test_session.delete(creator)
        test_session.commit()

        retrieved = test_session.query(Ticket).filter_by(id=ticket_id).first()
        assert retrieved is None

    def test_delete_organization_deletes_ticket(self, test_session, sample_user):
        """Test deleting the organization cascades to delete the ticket."""
        org = Organization(
            id=uuid4(),
            name="Cascade Org",
            join_code="TKT001",
            created_by=sample_user.id
        )
        test_session.add(org)
        test_session.commit()

        ticket = Ticket(
            id=uuid4(),
            title="Cascade Ticket",
            organization_id=org.id,
            created_by=sample_user.id,
            status=TicketStatus.TODO,
            priority=Priority.MEDIUM
        )
        test_session.add(ticket)
        test_session.commit()

        ticket_id = ticket.id

        test_session.delete(org)
        test_session.commit()

        retrieved = test_session.query(Ticket).filter_by(id=ticket_id).first()
        assert retrieved is None

    def test_delete_ticket_deletes_tasks(self, test_session, sample_user, sample_organization):
        """Test deleting a ticket cascades to delete its tasks."""
        ticket = Ticket(
            id=uuid4(),
            title="Ticket with tasks",
            organization_id=sample_organization.id,
            created_by=sample_user.id,
            status=TicketStatus.TODO,
            priority=Priority.MEDIUM
        )
        test_session.add(ticket)
        test_session.commit()

        task = Task(
            id=uuid4(),
            title="Task to cascade",
            ticket_id=ticket.id,
            organization_id=sample_organization.id,
            created_by=sample_user.id,
            status=TaskStatus.IN_PROGRESS
        )
        test_session.add(task)
        test_session.commit()

        task_id = task.id

        test_session.delete(ticket)
        test_session.commit()

        retrieved = test_session.query(Task).filter_by(id=task_id).first()
        assert retrieved is None

    def test_delete_assignee_sets_ticket_assignee_null(self, test_session, sample_user, sample_organization):
        """Test deleting the assignee sets ticket's assignee_id to NULL."""
        assignee = User(
            id=uuid4(),
            email="ticket_assignee@example.com",
            name="Ticket Assignee",
            password_hash="hash"
        )
        test_session.add(assignee)
        test_session.commit()

        ticket = Ticket(
            id=uuid4(),
            title="Assigned ticket",
            organization_id=sample_organization.id,
            created_by=sample_user.id,
            assignee_id=assignee.id,
            status=TicketStatus.TODO,
            priority=Priority.MEDIUM
        )
        test_session.add(ticket)
        test_session.commit()

        ticket_id = ticket.id

        test_session.delete(assignee)
        test_session.commit()

        retrieved = test_session.query(Ticket).filter_by(id=ticket_id).first()
        assert retrieved is not None
        assert retrieved.assignee_id is None


class TestTicketQuerying:
    """Test querying tickets."""

    def test_filter_by_status(self, test_session, sample_user, sample_organization):
        """Test filtering tickets by status."""
        todo_ticket = Ticket(
            id=uuid4(),
            title="Todo ticket",
            organization_id=sample_organization.id,
            created_by=sample_user.id,
            status=TicketStatus.TODO,
            priority=Priority.LOW
        )
        done_ticket = Ticket(
            id=uuid4(),
            title="Done ticket",
            organization_id=sample_organization.id,
            created_by=sample_user.id,
            status=TicketStatus.COMPLETED,
            priority=Priority.LOW
        )
        test_session.add_all([todo_ticket, done_ticket])
        test_session.commit()

        todos = test_session.query(Ticket).filter_by(
            organization_id=sample_organization.id,
            status=TicketStatus.TODO
        ).all()

        assert len(todos) >= 1
        assert all(t.status == TicketStatus.TODO for t in todos)

    def test_filter_by_priority(self, test_session, sample_user, sample_organization):
        """Test filtering tickets by priority."""
        high_ticket = Ticket(
            id=uuid4(),
            title="High priority",
            organization_id=sample_organization.id,
            created_by=sample_user.id,
            status=TicketStatus.TODO,
            priority=Priority.HIGH
        )
        low_ticket = Ticket(
            id=uuid4(),
            title="Low priority",
            organization_id=sample_organization.id,
            created_by=sample_user.id,
            status=TicketStatus.TODO,
            priority=Priority.LOW
        )
        test_session.add_all([high_ticket, low_ticket])
        test_session.commit()

        high_priority = test_session.query(Ticket).filter_by(
            organization_id=sample_organization.id,
            priority=Priority.HIGH
        ).all()

        assert len(high_priority) >= 1
        assert all(t.priority == Priority.HIGH for t in high_priority)

    def test_filter_by_assignee(self, test_session, sample_user, sample_organization):
        """Test filtering tickets by assignee."""
        assigned = Ticket(
            id=uuid4(),
            title="Assigned",
            organization_id=sample_organization.id,
            created_by=sample_user.id,
            assignee_id=sample_user.id,
            status=TicketStatus.TODO,
            priority=Priority.MEDIUM
        )
        unassigned = Ticket(
            id=uuid4(),
            title="Unassigned",
            organization_id=sample_organization.id,
            created_by=sample_user.id,
            status=TicketStatus.TODO,
            priority=Priority.MEDIUM
        )
        test_session.add_all([assigned, unassigned])
        test_session.commit()

        assigned_tickets = test_session.query(Ticket).filter_by(
            assignee_id=sample_user.id
        ).all()

        assert len(assigned_tickets) >= 1
        assert all(t.assignee_id == sample_user.id for t in assigned_tickets)

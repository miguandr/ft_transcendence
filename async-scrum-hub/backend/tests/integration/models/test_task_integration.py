"""
Integration tests for Task model.

Tests actual database operations including CRUD and relationships.

to test a specific test (ex: test_create_task):
docker-compose exec backend pytest tests/integration/models/test_task_integration.py::TestTaskCRUD::test_create_task -v --tb=long
"""

import pytest
from uuid import uuid4
from sqlalchemy.exc import IntegrityError

from src.database.models import Task, Ticket, User, Organization
from src.database.models.enums import TicketStatus, TaskStatus, Priority


class TestTaskCRUD:
    """Test Task CRUD operations with database."""

    def test_create_task(self, test_session, sample_user, sample_organization, sample_ticket):
        """Test creating a task in the database."""
        task = Task(
            id=uuid4(),
            title="Implement login form",
            ticket_id=sample_ticket.id,
            organization_id=sample_organization.id,
            created_by=sample_user.id,
            status=TaskStatus.IN_PROGRESS
        )

        test_session.add(task)
        test_session.commit()

        assert task.id is not None
        assert task.title == "Implement login form"
        assert task.status == TaskStatus.IN_PROGRESS
        assert task.description is None
        assert task.assignee_id is None

    def test_create_task_with_description_and_assignee(self, test_session, sample_user, sample_organization, sample_ticket):
        """Test creating a task with optional fields."""
        task = Task(
            id=uuid4(),
            title="Write unit tests",
            description="Cover all edge cases",
            ticket_id=sample_ticket.id,
            organization_id=sample_organization.id,
            created_by=sample_user.id,
            assignee_id=sample_user.id,
            status=TaskStatus.IN_PROGRESS
        )

        test_session.add(task)
        test_session.commit()

        assert task.description == "Cover all edge cases"
        assert task.assignee_id == sample_user.id

    def test_read_task(self, test_session, sample_task):
        """Test reading a task from the database."""
        retrieved = test_session.query(Task).filter_by(id=sample_task.id).first()

        assert retrieved is not None
        assert retrieved.id == sample_task.id
        assert retrieved.title == sample_task.title
        assert retrieved.status == sample_task.status

    def test_update_task(self, test_session, sample_task):
        """Test updating a task."""
        sample_task.title = "Updated Task Title"
        sample_task.status = TaskStatus.COMPLETED
        test_session.commit()

        retrieved = test_session.query(Task).filter_by(id=sample_task.id).first()
        assert retrieved.title == "Updated Task Title"
        assert retrieved.status == TaskStatus.COMPLETED

    def test_delete_task(self, test_session, sample_user, sample_organization, sample_ticket):
        """Test deleting a task."""
        task = Task(
            id=uuid4(),
            title="To be deleted",
            ticket_id=sample_ticket.id,
            organization_id=sample_organization.id,
            created_by=sample_user.id,
            status=TaskStatus.IN_PROGRESS
        )
        test_session.add(task)
        test_session.commit()

        task_id = task.id
        test_session.delete(task)
        test_session.commit()

        retrieved = test_session.query(Task).filter_by(id=task_id).first()
        assert retrieved is None


class TestTaskRelationships:
    """Test Task relationships with other models."""

    def test_task_to_ticket_relationship(self, test_session, sample_task, sample_ticket):
        """Test task can access its parent ticket."""
        assert sample_task.ticket is not None
        assert sample_task.ticket.id == sample_ticket.id
        assert sample_task.ticket.title == sample_ticket.title

    def test_task_to_creator_relationship(self, test_session, sample_task, sample_user):
        """Test task can access its creator."""
        assert sample_task.creator is not None
        assert sample_task.creator.id == sample_user.id
        assert sample_task.creator.email == sample_user.email

    def test_task_to_organization_relationship(self, test_session, sample_task, sample_organization):
        """Test task can access its organization."""
        assert sample_task.organization is not None
        assert sample_task.organization.id == sample_organization.id
        assert sample_task.organization.name == sample_organization.name

    def test_task_to_assignee_relationship(self, test_session, sample_user, sample_organization, sample_ticket):
        """Test task can access its assignee."""
        task = Task(
            id=uuid4(),
            title="Assigned task",
            ticket_id=sample_ticket.id,
            organization_id=sample_organization.id,
            created_by=sample_user.id,
            assignee_id=sample_user.id,
            status=TaskStatus.IN_PROGRESS
        )
        test_session.add(task)
        test_session.commit()

        assert task.assignee is not None
        assert task.assignee.id == sample_user.id

    def test_ticket_to_tasks_back_reference(self, test_session, sample_user, sample_organization, sample_ticket):
        """Test ticket can access its tasks via back-reference."""
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
            status=TaskStatus.COMPLETED
        )

        test_session.add_all([task1, task2])
        test_session.commit()
        test_session.refresh(sample_ticket)

        assert len(sample_ticket.tasks) == 2


class TestTaskCascadeDelete:
    """Test cascade delete behavior."""

    def test_delete_ticket_deletes_tasks(self, test_session, sample_user, sample_organization):
        """Test deleting a ticket cascades to delete its tasks."""
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
            title="Child Task",
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

    def test_delete_creator_deletes_tasks(self, test_session, sample_organization, sample_ticket):
        """Test deleting the creator cascades to delete their tasks."""
        creator = User(
            id=uuid4(),
            email="task_creator@example.com",
            name="Task Creator",
            password_hash="hash"
        )
        test_session.add(creator)
        test_session.commit()

        task = Task(
            id=uuid4(),
            title="Creator's Task",
            ticket_id=sample_ticket.id,
            organization_id=sample_organization.id,
            created_by=creator.id,
            status=TaskStatus.IN_PROGRESS
        )
        test_session.add(task)
        test_session.commit()

        task_id = task.id

        test_session.delete(creator)
        test_session.commit()

        retrieved = test_session.query(Task).filter_by(id=task_id).first()
        assert retrieved is None

    def test_delete_organization_deletes_tasks(self, test_session, sample_user):
        """Test deleting an organization cascades to delete its tasks."""
        org = Organization(
            id=uuid4(),
            name="Cascade Org",
            join_code="TSK001",
            created_by=sample_user.id
        )
        test_session.add(org)
        test_session.commit()

        ticket = Ticket(
            id=uuid4(),
            title="Parent Ticket",
            organization_id=org.id,
            created_by=sample_user.id,
            status=TicketStatus.TODO,
            priority=Priority.MEDIUM
        )
        test_session.add(ticket)
        test_session.commit()

        task = Task(
            id=uuid4(),
            title="Cascade Task",
            ticket_id=ticket.id,
            organization_id=org.id,
            created_by=sample_user.id,
            status=TaskStatus.IN_PROGRESS
        )
        test_session.add(task)
        test_session.commit()

        task_id = task.id

        test_session.delete(org)
        test_session.commit()

        retrieved = test_session.query(Task).filter_by(id=task_id).first()
        assert retrieved is None

    def test_delete_assignee_sets_task_assignee_null(self, test_session, sample_user, sample_organization, sample_ticket):
        """Test deleting the assignee sets task's assignee_id to NULL."""
        assignee = User(
            id=uuid4(),
            email="task_assignee@example.com",
            name="Task Assignee",
            password_hash="hash"
        )
        test_session.add(assignee)
        test_session.commit()

        task = Task(
            id=uuid4(),
            title="Assigned task",
            ticket_id=sample_ticket.id,
            organization_id=sample_organization.id,
            created_by=sample_user.id,
            assignee_id=assignee.id,
            status=TaskStatus.IN_PROGRESS
        )
        test_session.add(task)
        test_session.commit()

        task_id = task.id

        test_session.delete(assignee)
        test_session.commit()

        retrieved = test_session.query(Task).filter_by(id=task_id).first()
        assert retrieved is not None
        assert retrieved.assignee_id is None


class TestTaskQuerying:
    """Test querying tasks."""

    def test_filter_by_status(self, test_session, sample_user, sample_organization, sample_ticket):
        """Test filtering tasks by status."""
        in_progress = Task(
            id=uuid4(),
            title="In progress task",
            ticket_id=sample_ticket.id,
            organization_id=sample_organization.id,
            created_by=sample_user.id,
            status=TaskStatus.IN_PROGRESS
        )
        completed = Task(
            id=uuid4(),
            title="Completed task",
            ticket_id=sample_ticket.id,
            organization_id=sample_organization.id,
            created_by=sample_user.id,
            status=TaskStatus.COMPLETED
        )
        test_session.add_all([in_progress, completed])
        test_session.commit()

        in_progress_tasks = test_session.query(Task).filter_by(
            organization_id=sample_organization.id,
            status=TaskStatus.IN_PROGRESS
        ).all()

        assert len(in_progress_tasks) >= 1
        assert all(t.status == TaskStatus.IN_PROGRESS for t in in_progress_tasks)

    def test_filter_by_ticket(self, test_session, sample_user, sample_organization, sample_ticket):
        """Test filtering tasks by ticket."""
        other_ticket = Ticket(
            id=uuid4(),
            title="Other Ticket",
            organization_id=sample_organization.id,
            created_by=sample_user.id,
            status=TicketStatus.TODO,
            priority=Priority.LOW
        )
        test_session.add(other_ticket)
        test_session.commit()

        task_in_sample = Task(
            id=uuid4(),
            title="In sample ticket",
            ticket_id=sample_ticket.id,
            organization_id=sample_organization.id,
            created_by=sample_user.id,
            status=TaskStatus.IN_PROGRESS
        )
        task_in_other = Task(
            id=uuid4(),
            title="In other ticket",
            ticket_id=other_ticket.id,
            organization_id=sample_organization.id,
            created_by=sample_user.id,
            status=TaskStatus.IN_PROGRESS
        )
        test_session.add_all([task_in_sample, task_in_other])
        test_session.commit()

        tasks_for_sample = test_session.query(Task).filter_by(
            ticket_id=sample_ticket.id
        ).all()

        assert len(tasks_for_sample) >= 1
        assert all(t.ticket_id == sample_ticket.id for t in tasks_for_sample)

    def test_filter_by_assignee(self, test_session, sample_user, sample_organization, sample_ticket):
        """Test filtering tasks by assignee."""
        assigned = Task(
            id=uuid4(),
            title="Assigned task",
            ticket_id=sample_ticket.id,
            organization_id=sample_organization.id,
            created_by=sample_user.id,
            assignee_id=sample_user.id,
            status=TaskStatus.IN_PROGRESS
        )
        unassigned = Task(
            id=uuid4(),
            title="Unassigned task",
            ticket_id=sample_ticket.id,
            organization_id=sample_organization.id,
            created_by=sample_user.id,
            status=TaskStatus.IN_PROGRESS
        )
        test_session.add_all([assigned, unassigned])
        test_session.commit()

        assigned_tasks = test_session.query(Task).filter_by(
            assignee_id=sample_user.id
        ).all()

        assert len(assigned_tasks) >= 1
        assert all(t.assignee_id == sample_user.id for t in assigned_tasks)

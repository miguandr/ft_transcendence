"""
Unit tests for Task model.

Tests model structure, relationships, and constraints without database.

to test a specific test (ex: test_task_table_name):
docker-compose exec backend pytest tests/unit/models/test_task.py::TestTaskModel::test_task_table_name -v --tb=long
"""

from uuid import uuid4

from src.database.models import Task
from src.database.models.enums import TaskStatus


class TestTaskModel:
    """Test Task model structure and attributes."""

    def test_task_table_name(self):
        """Test that table name is correctly set."""
        assert Task.__tablename__ == "tasks"

    def test_task_has_required_columns(self):
        """Test that Task model has all required columns."""
        columns = [c.name for c in Task.__table__.columns]

        required_columns = [
            'id',
            'title',
            'description',
            'status',
            'ticket_id',
            'created_by',
            'organization_id',
            'assignee_id',
            'created_at',
            'updated_at',
        ]

        for column in required_columns:
            assert column in columns, f"Missing column: {column}"

    def test_task_foreign_keys(self):
        """Test that Task has correct foreign keys."""
        fk_targets = [fk.target_fullname for fk in Task.__table__.foreign_keys]

        assert 'tickets.id' in fk_targets
        assert 'organizations.id' in fk_targets
        assert fk_targets.count('users.id') == 2, "Should have 2 FKs to users (created_by, assignee_id)"

    def test_task_relationships(self):
        """Test that Task has correct relationships."""
        assert hasattr(Task, 'ticket')
        assert hasattr(Task, 'creator')
        assert hasattr(Task, 'assignee')
        assert hasattr(Task, 'organization')

    def test_task_instance_creation(self):
        """Test creating a Task instance without database."""
        task_id = uuid4()

        task = Task(
            id=task_id,
            title="Test Task",
            ticket_id=uuid4(),
            created_by=uuid4(),
            organization_id=uuid4(),
            status=TaskStatus.IN_PROGRESS
        )

        assert task.id == task_id
        assert task.title == "Test Task"
        assert task.status == TaskStatus.IN_PROGRESS
        assert task.description is None
        assert task.assignee_id is None
        assert task.created_at is None  # set by DB on insert
        assert task.updated_at is None  # set by DB on insert


class TestTaskColumnTypes:
    """Test Task column types and nullability."""

    def test_id_column_is_uuid(self):
        """Test id column is UUID type."""
        id_column = Task.__table__.columns['id']
        assert str(id_column.type) == 'UUID'
        assert id_column.primary_key is True
        assert id_column.nullable is False

    def test_title_not_nullable(self):
        """Test title is required."""
        assert Task.__table__.columns['title'].nullable is False

    def test_description_is_nullable(self):
        """Test description is optional."""
        assert Task.__table__.columns['description'].nullable is True

    def test_status_not_nullable(self):
        """Test status is required."""
        assert Task.__table__.columns['status'].nullable is False

    def test_ticket_id_not_nullable(self):
        """Test ticket_id is required."""
        assert Task.__table__.columns['ticket_id'].nullable is False

    def test_created_by_not_nullable(self):
        """Test created_by is required."""
        assert Task.__table__.columns['created_by'].nullable is False

    def test_organization_id_not_nullable(self):
        """Test organization_id is required."""
        assert Task.__table__.columns['organization_id'].nullable is False

    def test_assignee_id_is_nullable(self):
        """Test assignee_id is optional."""
        assert Task.__table__.columns['assignee_id'].nullable is True


class TestTaskEnum:
    """Test TaskStatus enum."""

    def test_task_status_values(self):
        """Test TaskStatus enum has correct values."""
        assert TaskStatus.IN_PROGRESS.value == 'in_progress'
        assert TaskStatus.COMPLETED.value == 'completed'

    def test_task_status_count(self):
        """Test TaskStatus has exactly 2 values."""
        assert len(list(TaskStatus)) == 2


class TestTaskForeignKeyOnDelete:
    """Test Task foreign key cascade behaviors."""

    def test_ticket_cascade_on_delete(self):
        """Test ticket_id FK has CASCADE on delete."""
        ticket_fk = None
        for fk in Task.__table__.foreign_keys:
            if 'tickets.id' in fk.target_fullname:
                ticket_fk = fk
                break

        assert ticket_fk is not None
        assert ticket_fk.ondelete == 'CASCADE'

    def test_created_by_cascade_on_delete(self):
        """Test created_by FK has CASCADE on delete."""
        created_by_fk = None
        for fk in Task.__table__.foreign_keys:
            if fk.parent.name == 'created_by':
                created_by_fk = fk
                break

        assert created_by_fk is not None
        assert created_by_fk.ondelete == 'CASCADE'

    def test_organization_cascade_on_delete(self):
        """Test organization_id FK has CASCADE on delete."""
        org_fk = None
        for fk in Task.__table__.foreign_keys:
            if 'organizations.id' in fk.target_fullname:
                org_fk = fk
                break

        assert org_fk is not None
        assert org_fk.ondelete == 'CASCADE'

    def test_assignee_set_null_on_delete(self):
        """Test assignee_id FK has SET NULL on delete."""
        assignee_fk = None
        for fk in Task.__table__.foreign_keys:
            if fk.parent.name == 'assignee_id':
                assignee_fk = fk
                break

        assert assignee_fk is not None
        assert assignee_fk.ondelete == 'SET NULL'

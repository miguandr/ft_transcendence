"""
Unit tests for Ticket model.

Tests model structure, relationships, and constraints without database.

to test a specific test (ex: test_ticket_table_name):
docker-compose exec backend pytest tests/unit/models/test_ticket.py::TestTicketModel::test_ticket_table_name -v --tb=long
"""

from uuid import uuid4

from src.database.models import Ticket
from src.database.models.enums import TicketStatus, Priority


class TestTicketModel:
    """Test Ticket model structure and attributes."""

    def test_ticket_table_name(self):
        """Test that table name is correctly set."""
        assert Ticket.__tablename__ == "tickets"

    def test_ticket_has_required_columns(self):
        """Test that Ticket model has all required columns."""
        columns = [c.name for c in Ticket.__table__.columns]

        required_columns = [
            'id',
            'title',
            'description',
            'status',
            'priority',
            'created_by',
            'organization_id',
            'assignee_id',
            'created_at',
            'updated_at',
        ]

        for column in required_columns:
            assert column in columns, f"Missing column: {column}"

    def test_ticket_foreign_keys(self):
        """Test that Ticket has correct foreign keys."""
        fk_targets = [fk.target_fullname for fk in Ticket.__table__.foreign_keys]

        assert 'organizations.id' in fk_targets
        assert fk_targets.count('users.id') == 2, "Should have 2 FKs to users (created_by, assignee_id)"

    def test_ticket_relationships(self):
        """Test that Ticket has correct relationships."""
        assert hasattr(Ticket, 'tasks')
        assert hasattr(Ticket, 'creator')
        assert hasattr(Ticket, 'assignee')
        assert hasattr(Ticket, 'organization')
        assert hasattr(Ticket, 'blockers')

    def test_ticket_instance_creation(self):
        """Test creating a Ticket instance without database."""
        ticket_id = uuid4()

        ticket = Ticket(
            id=ticket_id,
            title="Test Ticket",
            created_by=uuid4(),
            organization_id=uuid4(),
            status=TicketStatus.TODO,
            priority=Priority.MEDIUM
        )

        assert ticket.id == ticket_id
        assert ticket.title == "Test Ticket"
        assert ticket.status == TicketStatus.TODO
        assert ticket.priority == Priority.MEDIUM
        assert ticket.description is None
        assert ticket.assignee_id is None


class TestTicketColumnTypes:
    """Test Ticket column types and nullability."""

    def test_id_column_is_uuid(self):
        """Test id column is UUID type."""
        id_column = Ticket.__table__.columns['id']
        assert str(id_column.type) == 'UUID'
        assert id_column.primary_key is True
        assert id_column.nullable is False

    def test_title_not_nullable(self):
        """Test title is required."""
        assert Ticket.__table__.columns['title'].nullable is False

    def test_description_is_nullable(self):
        """Test description is optional."""
        assert Ticket.__table__.columns['description'].nullable is True

    def test_status_not_nullable(self):
        """Test status is required."""
        assert Ticket.__table__.columns['status'].nullable is False

    def test_priority_not_nullable(self):
        """Test priority is required."""
        assert Ticket.__table__.columns['priority'].nullable is False

    def test_created_by_not_nullable(self):
        """Test created_by is required."""
        assert Ticket.__table__.columns['created_by'].nullable is False

    def test_organization_id_not_nullable(self):
        """Test organization_id is required."""
        assert Ticket.__table__.columns['organization_id'].nullable is False

    def test_assignee_id_is_nullable(self):
        """Test assignee_id is optional."""
        assert Ticket.__table__.columns['assignee_id'].nullable is True


class TestTicketEnums:
    """Test TicketStatus and Priority enums."""

    def test_ticket_status_values(self):
        """Test TicketStatus enum has correct values."""
        assert TicketStatus.TODO.value == 'todo'
        assert TicketStatus.IN_PROGRESS.value == 'in_progress'
        assert TicketStatus.COMPLETED.value == 'completed'

    def test_ticket_status_count(self):
        """Test TicketStatus has exactly 3 values."""
        assert len(list(TicketStatus)) == 3

    def test_priority_values(self):
        """Test Priority enum has correct values."""
        assert Priority.LOW.value == 'low'
        assert Priority.MEDIUM.value == 'medium'
        assert Priority.HIGH.value == 'high'

    def test_priority_count(self):
        """Test Priority has exactly 3 values."""
        assert len(list(Priority)) == 3


class TestTicketForeignKeyOnDelete:
    """Test Ticket foreign key cascade behaviors."""

    def test_created_by_cascade_on_delete(self):
        """Test created_by FK has CASCADE on delete."""
        created_by_fk = None
        for fk in Ticket.__table__.foreign_keys:
            if fk.parent.name == 'created_by':
                created_by_fk = fk
                break

        assert created_by_fk is not None
        assert created_by_fk.ondelete == 'CASCADE'

    def test_organization_cascade_on_delete(self):
        """Test organization_id FK has CASCADE on delete."""
        org_fk = None
        for fk in Ticket.__table__.foreign_keys:
            if 'organizations.id' in fk.target_fullname:
                org_fk = fk
                break

        assert org_fk is not None
        assert org_fk.ondelete == 'CASCADE'

    def test_assignee_set_null_on_delete(self):
        """Test assignee_id FK has SET NULL on delete."""
        assignee_fk = None
        for fk in Ticket.__table__.foreign_keys:
            if fk.parent.name == 'assignee_id':
                assignee_fk = fk
                break

        assert assignee_fk is not None
        assert assignee_fk.ondelete == 'SET NULL'

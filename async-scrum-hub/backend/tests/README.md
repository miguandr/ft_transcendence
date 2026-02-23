# Test Suite for Async Scrum Hub Backend

This directory contains unit and integration tests for the backend models, services, and API endpoints.

## Test Structure

```
tests/
├── conftest.py              # Shared fixtures and test setup
├── unit/                    # Unit tests (SQLite in-memory, no real DB needed)
│   ├── models/              # Model structure tests
│   │   ├── test_standup.py
│   │   ├── test_blocker.py
│   │   ├── test_organization.py
│   │   ├── test_task.py
│   │   ├── test_ticket.py
│   │   └── test_user.py
│   ├── auth/                # Authentication tests
│   │   ├── conftest.py
│   │   └── test_auth.py
│   ├── config/              # Configuration / settings tests
│   │   ├── conftest.py
│   │   └── test_security.py
│   ├── standups/            # Standup service + route tests
│   │   ├── conftest.py
│   │   └── test_standups.py
│   └── blockers/            # Blocker service + route tests
│       ├── conftest.py
│       └── test_blockers.py
└── integration/             # Integration tests (with database)
    └── models/              # Model CRUD and relationship tests
        ├── test_standup_integration.py
        ├── test_blocker_integration.py
        ├── test_organization_integration.py
        ├── test_task_integration.py
        ├── test_ticket_integration.py
        └── test_user_integration.py
```

## Running Tests

### Run All Tests
```bash
# Inside Docker container
docker-compose exec backend pytest

# Or locally (if you have pytest installed)
cd backend
pytest
```

### Run Specific Test Types

**Unit tests only:**
```bash
pytest tests/unit/
```

**Integration tests only:**
```bash
pytest tests/integration/
```

**Specific test file:**
```bash
pytest tests/unit/models/test_standup.py
```

**Specific test class:**
```bash
pytest tests/unit/models/test_standup.py::TestStandupModel
```

**Specific test function:**
```bash
pytest tests/unit/models/test_standup.py::TestStandupModel::test_standup_table_name
```

### Run Tests with Coverage

```bash
# Install coverage first
pip install pytest-cov

# Run with coverage report
pytest --cov=src --cov-report=html --cov-report=term
```

### Run Tests in Verbose Mode

```bash
pytest -v
```

### Run Tests with Output

```bash
pytest -s  # Shows print statements
```

## Test Fixtures

Each module has its own `conftest.py` with fixtures scoped to that module.
Common fixtures in the top-level `conftest.py`:

- `test_engine` - In-memory SQLite database engine
- `test_session` - Database session for tests
- `sample_user` - Pre-created test user
- `sample_organization` - Pre-created test organization
- `sample_standup` - Pre-created test standup
- `sample_blocker` - Pre-created test blocker

Module-specific fixtures (in `unit/standups/conftest.py` and `unit/blockers/conftest.py`):

- `client` - FastAPI test client with DB and auth overrides
- `db_setup` - Admin user + organization created via raw SQL
- `developer_user` / `non_developer_user` - Users with specific scrum roles
- `sample_blocker` / `resolved_blocker` - Blocker instances in different states

## Writing New Tests

### Unit Test Example

```python
def test_model_structure():
    """Test model has correct attributes."""
    assert hasattr(MyModel, 'id')
    assert hasattr(MyModel, 'name')
```

### Integration Test Example

```python
def test_create_model(test_session):
    """Test creating model in database."""
    instance = MyModel(name="Test")
    test_session.add(instance)
    test_session.commit()

    assert instance.id is not None
```

## Test Coverage Goals

- **Unit Tests**: Test model structure, relationships, constraints
- **Integration Tests**: Test CRUD operations, database queries, cascade behavior
- **Service Tests**: Test business logic, validations
- **API Tests**: Test endpoints, authentication, permissions

## Continuous Integration

Tests should be run automatically on:
- Every pull request
- Before merging to main/dev branches
- On deployment

## Notes

- Unit tests use SQLite in-memory database for speed
- Integration tests can use PostgreSQL test database
- Always clean up test data in teardown
- Use fixtures for common test data
- Mark slow tests with `@pytest.mark.slow`

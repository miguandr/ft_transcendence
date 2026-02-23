# Testing Quick Reference

Quick commands and examples for running tests.

## Most Common Commands

```bash
# Run all tests
docker-compose exec backend pytest

# Run with details
docker-compose exec backend pytest -v

# Run unit tests only (fast)
docker-compose exec backend pytest tests/unit/

# Run integration tests only
docker-compose exec backend pytest tests/integration/

# Run tests for a specific model
docker-compose exec backend pytest tests/unit/models/test_standup.py
docker-compose exec backend pytest tests/integration/models/test_standup_integration.py

# Run with coverage
docker-compose exec backend pytest --cov=src --cov-report=term-missing

# Run specific test function
docker-compose exec backend pytest tests/unit/models/test_standup.py::TestStandupModel::test_standup_table_name

# Run tests matching pattern
docker-compose exec backend pytest -k standup
docker-compose exec backend pytest -k "create or update"

# Stop on first failure
docker-compose exec backend pytest -x

# Show print statements
docker-compose exec backend pytest -s

# Run with detailed failure info
docker-compose exec backend pytest --tb=long
```

## Test File Organization

```
tests/
├── conftest.py              # Shared fixtures: test_session, sample_user, etc.
├── unit/                    # Fast tests, SQLite in-memory
│   ├── models/              # Model structure tests
│   │   ├── test_standup.py
│   │   ├── test_blocker.py
│   │   ├── test_organization.py
│   │   ├── test_task.py
│   │   ├── test_ticket.py
│   │   └── test_user.py
│   ├── auth/                # Auth tests (conftest.py + test_auth.py)
│   ├── config/              # Settings tests (conftest.py + test_security.py)
│   ├── standups/            # Standup service + route tests
│   └── blockers/            # Blocker service + route tests
└── integration/             # Slower tests, use DB
    └── models/
        ├── test_standup_integration.py
        ├── test_blocker_integration.py
        ├── test_organization_integration.py
        ├── test_task_integration.py
        ├── test_ticket_integration.py
        └── test_user_integration.py
```

## Available Fixtures

Use these in any test function as parameters:

```python
def test_example(test_session, sample_user, sample_organization, sample_standup, sample_blocker):
    # test_session: Database session
    # sample_user: Pre-created user
    # sample_organization: Pre-created organization
    # sample_standup: Pre-created standup
    # sample_blocker: Pre-created blocker
    pass
```

## Writing a New Test

### Unit Test Template

```python
def test_model_structure():
    """Test description."""
    from src.database.models import MyModel

    # Test code
    assert hasattr(MyModel, 'id')
    assert hasattr(MyModel, 'name')
```

### Integration Test Template

```python
def test_create_model(test_session, sample_user):
    """Test creating model."""
    from uuid import uuid4
    from src.database.models import MyModel

    instance = MyModel(
        id=uuid4(),
        user_id=sample_user.id,
        name="Test"
    )

    test_session.add(instance)
    test_session.commit()

    assert instance.id is not None
```

## Pytest Flags Reference

| Flag | Description |
|------|-------------|
| `-v` | Verbose output |
| `-s` | Show print statements |
| `-x` | Stop on first failure |
| `-k PATTERN` | Run tests matching pattern |
| `--cov=src` | Show code coverage |
| `--tb=short` | Short traceback format |
| `--tb=long` | Long traceback format |
| `--pdb` | Drop into debugger on failure |
| `-l` | Show local variables on failure |
| `--durations=10` | Show 10 slowest tests |
| `-m MARKER` | Run tests with specific marker |
| `-rs` | Show why tests were skipped |

## Test Status Symbols

```
.  = Test passed
F  = Test failed
E  = Test error
s  = Test skipped
x  = Expected failure
X  = Unexpected pass
```

## Common Assertions

```python
# Equality
assert x == y
assert x != y

# Truth
assert x
assert not x
assert x is True
assert x is False

# None
assert x is None
assert x is not None

# Membership
assert x in [1, 2, 3]
assert 'key' in dict

# Type checking
assert isinstance(x, str)
assert isinstance(x, (str, int))

# Exceptions
import pytest
with pytest.raises(ValueError):
    function_that_should_raise()

# Attributes
assert hasattr(obj, 'attribute')
```

## Troubleshooting

### Tests not found
```bash
# Make sure you're in backend directory
cd backend
pytest
```

### Import errors
```bash
# Check PYTHONPATH
cd backend
PYTHONPATH=. pytest
```

### Database errors
```bash
# Integration tests use in-memory SQLite
# Check conftest.py fixtures
```

### One failing test (Task model)
```bash
# Expected until Freddy implements Task model
# Skip with: pytest -k "not task"
```

## Examples

### Test a specific module
```bash
# All Standup tests (models + routes)
docker-compose exec backend pytest -k standup -v

# All Blocker tests (models + routes)
docker-compose exec backend pytest -k blocker -v

# Route tests only
docker-compose exec backend pytest tests/unit/standups/ tests/unit/blockers/ -v
```

### Test specific functionality
```bash
# All CRUD tests
docker-compose exec backend pytest -k crud -v

# All relationship tests
docker-compose exec backend pytest -k relationship -v

# All cascade delete tests
docker-compose exec backend pytest -k cascade -v
```

### Before committing
```bash
# Run all unit tests (fast check)
docker-compose exec backend pytest tests/unit/ -v

# If passing, run all tests
docker-compose exec backend pytest -v

# Check coverage
docker-compose exec backend pytest --cov=src --cov-report=term-missing
```

## Current Test Coverage

```
📁 Unit tests (unit/models/)        — model structure for all 6 models
📁 Unit tests (unit/auth/)          — authentication logic
📁 Unit tests (unit/config/)        — settings / security config
📁 Unit tests (unit/standups/)      — standup service + API routes
📁 Unit tests (unit/blockers/)      — blocker service + API routes
📁 Integration tests (integration/) — CRUD + relationships for all models

Run to see total count:
docker-compose exec backend pytest --collect-only
```

## Need Help?

- Full guide: See [TESTING.md](TESTING.md)
- Pytest docs: https://docs.pytest.org/
- Ask team members for help

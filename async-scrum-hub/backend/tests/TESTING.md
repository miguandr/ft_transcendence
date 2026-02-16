# Testing Guide for Async Scrum Hub Backend

This guide explains how to run and write tests for the Async Scrum Hub backend application.

## Table of Contents

- [Quick Start](#quick-start)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Understanding Test Results](#understanding-test-results)
- [Writing New Tests](#writing-new-tests)
- [Continuous Integration](#continuous-integration)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

### 1. Install Test Dependencies

Tests are already set up in your Docker environment. If running locally:

```bash
pip install pytest pytest-asyncio
```

### 2. Run All Tests

Inside Docker container (recommended):
```bash
docker-compose exec backend pytest
```

Outside Docker (if you have local Python setup):
```bash
cd backend
pytest
```

### 3. See Test Results

You should see output like:
```
============================= test session starts ==============================
platform linux -- Python 3.11.14, pytest-9.0.2, pluggy-1.6.0
collected 67 items

tests/unit/models/test_standup.py ......................  [ 32%]
tests/unit/models/test_blocker.py ....................    [ 65%]
tests/integration/models/test_standup_integration.py ..... [ 85%]
tests/integration/models/test_blocker_integration.py ..... [100%]

============================== 67 passed in 2.45s ==============================
```

---

## Test Structure

```
backend/tests/
├── conftest.py              # Shared test fixtures (database, sample data)
├── README.md                # Detailed testing information
│
├── unit/                    # Unit tests (fast, no database)
│   └── models/
│       ├── test_standup.py           # Tests for Standup model structure
│       └── test_blocker.py           # Tests for Blocker model structure
│
└── integration/             # Integration tests (slower, uses database)
    └── models/
        ├── test_standup_integration.py    # Tests for Standup CRUD operations
        └── test_blocker_integration.py    # Tests for Blocker CRUD operations
```

### Unit Tests vs Integration Tests

| Unit Tests | Integration Tests |
|------------|-------------------|
| Fast (~0.1s each) | Slower (~0.5s each) |
| No database required | Uses test database |
| Test structure & logic | Test database operations |
| Run frequently | Run before commits |

---

## Running Tests

### Basic Commands

**Run all tests:**
```bash
docker-compose exec backend pytest
```

**Run with verbose output:**
```bash
docker-compose exec backend pytest -v
```

**Run with detailed output (shows print statements):**
```bash
docker-compose exec backend pytest -s
```

**Run and show summary:**
```bash
docker-compose exec backend pytest --tb=short
```

### Run Specific Test Groups

**Unit tests only:**
```bash
docker-compose exec backend pytest tests/unit/
```

**Integration tests only:**
```bash
docker-compose exec backend pytest tests/integration/
```

**Only model tests:**
```bash
docker-compose exec backend pytest tests/unit/models/ tests/integration/models/
```

### Run Specific Test Files

**Single test file:**
```bash
docker-compose exec backend pytest tests/unit/models/test_standup.py
```

**Multiple test files:**
```bash
docker-compose exec backend pytest tests/unit/models/test_standup.py tests/unit/models/test_blocker.py
```

### Run Specific Test Classes or Functions

**Specific test class:**
```bash
docker-compose exec backend pytest tests/unit/models/test_standup.py::TestStandupModel
```

**Specific test function:**
```bash
docker-compose exec backend pytest tests/unit/models/test_standup.py::TestStandupModel::test_standup_table_name
```

**Using pattern matching (-k flag):**
```bash
# Run all tests with "standup" in the name
docker-compose exec backend pytest -k standup

# Run all tests with "create" in the name
docker-compose exec backend pytest -k create

# Run all tests with "cascade" or "delete" in the name
docker-compose exec backend pytest -k "cascade or delete"
```

### Running Tests with Coverage

**Install coverage:**
```bash
docker-compose exec backend pip install pytest-cov
```

**Run tests with coverage report:**
```bash
docker-compose exec backend pytest --cov=src --cov-report=term-missing
```

**Generate HTML coverage report:**
```bash
docker-compose exec backend pytest --cov=src --cov-report=html
# Open htmlcov/index.html in browser
```

### Running Tests in Watch Mode

**Install pytest-watch:**
```bash
docker-compose exec backend pip install pytest-watch
```

**Run tests automatically on file changes:**
```bash
docker-compose exec backend ptw -- tests/
```

---

## Understanding Test Results

### Successful Test Run

```
============================= test session starts ==============================
platform linux -- Python 3.11.14, pytest-9.0.2, pluggy-1.6.0
collected 67 items

tests/unit/models/test_standup.py ................       [23%]
tests/unit/models/test_blocker.py ..................     [50%]
tests/integration/models/test_standup_integration.py ... [75%]
tests/integration/models/test_blocker_integration.py ... [100%]

============================== 67 passed in 2.45s ==============================
```

**Legend:**
- `.` = Test passed
- `F` = Test failed
- `E` = Test error
- `s` = Test skipped
- `x` = Expected failure
- `X` = Unexpected pass

### Failed Test Example

```
FAILED tests/unit/models/test_standup.py::TestStandupModel::test_standup_repr
```

**What this means:**
- File: `tests/unit/models/test_standup.py`
- Class: `TestStandupModel`
- Function: `test_standup_repr`

**View details:**
```bash
docker-compose exec backend pytest tests/unit/models/test_standup.py::TestStandupModel::test_standup_repr -v
```

### Reading Test Output

**Verbose mode (-v):**
```
tests/unit/models/test_standup.py::TestStandupModel::test_standup_table_name PASSED
tests/unit/models/test_standup.py::TestStandupModel::test_standup_has_required_columns PASSED
```

**Summary at the end:**
```
=========================== short test summary info ============================
PASSED tests/unit/models/test_standup.py::TestStandupModel::test_standup_table_name
PASSED tests/unit/models/test_standup.py::TestStandupModel::test_standup_has_required_columns
```

---

## Writing New Tests

### Test File Naming Convention

- Test files must start with `test_` or end with `_test.py`
- Example: `test_standup.py`, `test_my_feature.py`

### Test Function Naming Convention

- Test functions must start with `test_`
- Use descriptive names: `test_create_standup_with_valid_data`
- Example:
  ```python
  def test_standup_has_unique_constraint():
      """Test that Standup has unique constraint."""
      # Test code here
  ```

### Using Fixtures

Fixtures are defined in `conftest.py` and can be used in any test:

```python
def test_create_standup(test_session, sample_user, sample_organization):
    """Test creating a standup."""
    standup = Standup(
        id=uuid4(),
        organization_id=sample_organization.id,
        created_by=sample_user.id,
        today="Test standup",
        standup_date=date.today()
    )

    test_session.add(standup)
    test_session.commit()

    assert standup.id is not None
```

### Available Fixtures

From `conftest.py`:
- `test_engine` - In-memory SQLite database engine
- `test_session` - Database session for tests
- `sample_user` - Pre-created test user
- `sample_organization` - Pre-created test organization
- `sample_standup` - Pre-created test standup
- `sample_blocker` - Pre-created test blocker

### Unit Test Template

```python
"""
Unit tests for MyModel.
"""

import pytest
from src.database.models import MyModel


class TestMyModel:
    """Test MyModel structure."""

    def test_model_has_required_columns(self):
        """Test model has all required columns."""
        columns = [c.name for c in MyModel.__table__.columns]

        assert 'id' in columns
        assert 'name' in columns
        # Add more assertions
```

### Integration Test Template

```python
"""
Integration tests for MyModel.
"""

import pytest
from uuid import uuid4
from src.database.models import MyModel


class TestMyModelCRUD:
    """Test MyModel CRUD operations."""

    def test_create_model(self, test_session, sample_user):
        """Test creating model in database."""
        instance = MyModel(
            id=uuid4(),
            name="Test",
            user_id=sample_user.id
        )

        test_session.add(instance)
        test_session.commit()

        assert instance.id is not None
        assert instance.name == "Test"
```

---

## Continuous Integration

### Running Tests in CI/CD

**GitHub Actions example:**

```yaml
# .github/workflows/test.yml
name: Run Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt

      - name: Run tests
        run: |
          cd backend
          pytest --cov=src --cov-report=xml

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

### Pre-commit Hooks

Run tests automatically before commits:

```bash
# .git/hooks/pre-commit
#!/bin/bash
docker-compose exec backend pytest tests/unit/
if [ $? -ne 0 ]; then
    echo "Tests failed. Commit aborted."
    exit 1
fi
```

---

## Troubleshooting

### Common Issues

#### 1. Tests Not Found

**Problem:** `collected 0 items`

**Solutions:**
- Check you're in the correct directory: `cd backend`
- Verify test files start with `test_`
- Check pytest.ini configuration

#### 2. Import Errors

**Problem:** `ModuleNotFoundError: No module named 'src'`

**Solutions:**
- Run tests from backend directory
- Check PYTHONPATH is set correctly
- Ensure `__init__.py` files exist

#### 3. Database Errors

**Problem:** `Table 'standups' doesn't exist`

**Solutions:**
- Tests use in-memory SQLite, not PostgreSQL
- Check fixtures in conftest.py
- Verify `Base.metadata.create_all()` is called

#### 4. Fixture Errors

**Problem:** `fixture 'sample_user' not found`

**Solutions:**
- Check conftest.py exists in tests directory
- Verify fixture is defined correctly
- Ensure you're running pytest from correct directory

#### 5. One Test Fails Due to Task Model

**Problem:** `'Task' failed to locate a name`

**Expected behavior:** This is normal until Task model is implemented by Freddy.

**Workaround:** Skip tests that depend on Task:
```bash
pytest -k "not task"
```

### Debug Failed Tests

**Run with pdb debugger:**
```bash
docker-compose exec backend pytest --pdb
```

**Show local variables on failure:**
```bash
docker-compose exec backend pytest -l
```

**Stop on first failure:**
```bash
docker-compose exec backend pytest -x
```

**Show why tests were skipped:**
```bash
docker-compose exec backend pytest -rs
```

### Performance Issues

**Run tests in parallel (install pytest-xdist):**
```bash
docker-compose exec backend pip install pytest-xdist
docker-compose exec backend pytest -n auto
```

**Profile slow tests:**
```bash
docker-compose exec backend pytest --durations=10
```

---

## Test Markers

Mark tests for selective running:

```python
import pytest

@pytest.mark.unit
def test_something():
    """Unit test."""
    pass

@pytest.mark.integration
def test_database_operation(test_session):
    """Integration test."""
    pass

@pytest.mark.slow
def test_complex_operation():
    """Slow test."""
    pass
```

**Run tests by marker:**
```bash
# Only unit tests
docker-compose exec backend pytest -m unit

# Only integration tests
docker-compose exec backend pytest -m integration

# Skip slow tests
docker-compose exec backend pytest -m "not slow"
```

---

## Best Practices

### DO ✅

1. **Run tests frequently** - After every code change
2. **Write descriptive test names** - `test_create_standup_with_valid_data`
3. **Use fixtures** - Don't repeat setup code
4. **Test edge cases** - Null values, empty strings, max lengths
5. **Keep tests isolated** - Each test should be independent
6. **Clean up after tests** - Use fixtures and teardown
7. **Document complex tests** - Add docstrings explaining what's tested

### DON'T ❌

1. **Don't test framework code** - Trust SQLAlchemy works
2. **Don't write slow tests** - Use mocks when possible
3. **Don't share state between tests** - Each test should be independent
4. **Don't test implementation details** - Test behavior, not internals
5. **Don't skip failing tests** - Fix them or remove them
6. **Don't commit without running tests** - Always run tests first

---

## Getting Help

### Resources

- **Pytest Documentation:** https://docs.pytest.org/
- **SQLAlchemy Testing:** https://docs.sqlalchemy.org/en/20/orm/session_transaction.html
- **FastAPI Testing:** https://fastapi.tiangolo.com/tutorial/testing/

### Team Support

- Ask in team chat for testing help
- Review existing tests for examples
- Pair program on complex tests

---

## Summary

**Quick Commands:**
```bash
# Run all tests
docker-compose exec backend pytest

# Run unit tests only
docker-compose exec backend pytest tests/unit/

# Run with verbose output
docker-compose exec backend pytest -v

# Run with coverage
docker-compose exec backend pytest --cov=src

# Run specific test
docker-compose exec backend pytest tests/unit/models/test_standup.py::TestStandupModel::test_standup_table_name
```

**Test Coverage:**
- ✅ 67 total tests
- ✅ 32 unit tests (model structure)
- ✅ 35 integration tests (database operations)
- ✅ Models: Standup and Blocker fully covered

**Next Steps:**
1. Run tests after making changes
2. Add tests for new features
3. Keep coverage above 80%
4. Run tests in CI/CD pipeline

Happy testing! 🧪

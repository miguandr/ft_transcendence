"""
Pytest configuration and fixtures for testing.

This file provides shared fixtures for all tests including:
- Test database setup
- Test client
- Sample data factories
"""

import pytest
from datetime import datetime, date
from uuid import uuid4
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from src.database.base import Base
from src.database.models import User, Organization, Standup, Blocker


@pytest.fixture(scope="function")
def test_engine():
    """Create an in-memory SQLite database for testing."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def test_session(test_engine):
    """Create a new database session for a test."""
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    session = TestingSessionLocal()
    yield session
    session.rollback()
    session.close()


@pytest.fixture
def sample_user(test_session):
    """Create a sample user for testing."""
    user = User(
        id=uuid4(),
        email="test@example.com",
        name="Test User",
        password_hash="hashed_password",
        org_role="member",
        scrum_role="developer"
    )
    test_session.add(user)
    test_session.commit()
    test_session.refresh(user)
    return user


@pytest.fixture
def sample_organization(test_session, sample_user):
    """Create a sample organization for testing."""
    org = Organization(
        id=uuid4(),
        name="Test Organization",
        join_code="TEST123",
        created_by=sample_user.id
    )
    test_session.add(org)
    test_session.commit()
    test_session.refresh(org)
    return org


@pytest.fixture
def sample_standup(test_session, sample_user, sample_organization):
    """Create a sample standup for testing."""
    standup = Standup(
        id=uuid4(),
        organization_id=sample_organization.id,
        created_by=sample_user.id,
        today="Working on implementing tests",
        yesterday="Implemented database models",
        blocker_ids=[],
        standup_date=date.today()
    )
    test_session.add(standup)
    test_session.commit()
    test_session.refresh(standup)
    return standup


@pytest.fixture
def sample_blocker(test_session, sample_user, sample_organization):
    """Create a sample blocker for testing."""
    from src.database.models.blocker import BlockerStatus

    blocker = Blocker(
        id=uuid4(),
        organization_id=sample_organization.id,
        created_by=sample_user.id,
        description="Need help with database configuration",
        status=BlockerStatus.OPEN
    )
    test_session.add(blocker)
    test_session.commit()
    test_session.refresh(blocker)
    return blocker

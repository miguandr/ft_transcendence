"""
Conftest for blocker endpoint and service tests.

Sets up:
- Test environment variables (before any app import)
- In-memory SQLite database with manually created tables
- FastAPI TestClient with DB and auth dependency overrides
- Fixtures for user, organization, developer users, and blocker data
"""

import os

os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key-for-unit-tests")
os.environ.setdefault("JWT_ALGORITHM", "HS256")
os.environ.setdefault("ACCESS_TOKEN_EXPIRE_MINUTES", "30")

import pytest
from uuid import uuid4
from datetime import datetime, timezone
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi import FastAPI
from fastapi.testclient import TestClient

from src.database import get_db
from src.database.models import User, Organization, Blocker
from src.database.models.blocker import BlockerStatus
from src.api.deps import get_current_user
from src.blockers.routes import router


def _create_tables(engine):
	"""
	Create required tables using raw SQL.
	Avoids SQLite's inability to handle PostgreSQL ENUM types.
	"""
	with engine.connect() as conn:
		conn.execute(text("""
			CREATE TABLE IF NOT EXISTS users (
				id TEXT PRIMARY KEY,
				email TEXT UNIQUE NOT NULL,
				name TEXT NOT NULL,
				password_hash TEXT NOT NULL,
				avatar_url TEXT,
				organization_id TEXT,
				org_role TEXT,
				scrum_role TEXT,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
				updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
			)
		"""))
		conn.execute(text("""
			CREATE TABLE IF NOT EXISTS organizations (
				id TEXT PRIMARY KEY,
				name TEXT NOT NULL,
				join_code TEXT UNIQUE NOT NULL,
				created_by TEXT NOT NULL REFERENCES users(id),
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
				updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
			)
		"""))
		conn.execute(text("""
			CREATE TABLE IF NOT EXISTS tickets (
				id TEXT PRIMARY KEY,
				title TEXT NOT NULL,
				description TEXT,
				status TEXT NOT NULL DEFAULT 'todo',
				priority TEXT NOT NULL DEFAULT 'medium',
				created_by TEXT NOT NULL REFERENCES users(id),
				organization_id TEXT NOT NULL REFERENCES organizations(id),
				assignee_id TEXT REFERENCES users(id),
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
				updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
			)
		"""))
		conn.execute(text("""
			CREATE TABLE IF NOT EXISTS blockers (
				id TEXT PRIMARY KEY,
				organization_id TEXT NOT NULL REFERENCES organizations(id),
				created_by TEXT NOT NULL REFERENCES users(id),
				assignee_id TEXT REFERENCES users(id),
				description TEXT NOT NULL,
				status TEXT NOT NULL DEFAULT 'open',
				ticket_id TEXT REFERENCES tickets(id),
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
				updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
				resolved_at TIMESTAMP
			)
		"""))
		conn.commit()


@pytest.fixture(scope="function")
def test_engine():
	"""In-memory SQLite database with all required tables."""
	engine = create_engine(
		"sqlite:///:memory:",
		connect_args={"check_same_thread": False},
		poolclass=StaticPool,
	)
	_create_tables(engine)
	yield engine


@pytest.fixture(scope="function")
def db_setup(test_engine):
	"""
	Creates a user and organization in the DB.
	The user is an org admin with the developer scrum role.
	Returns (user, org, session).
	"""
	TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
	session = TestingSession()

	user = User(
		id=uuid4(),
		email="test@example.com",
		name="Test User",
		password_hash="hashed_password",
		org_role="admin",
		scrum_role="developer",
	)
	session.add(user)
	session.flush()

	org = Organization(
		id=uuid4(),
		name="Test Organization",
		join_code="TEST001",
		created_by=user.id,
	)
	session.add(org)
	session.flush()

	user.organization_id = org.id
	session.commit()
	session.refresh(user)
	session.refresh(org)

	yield user, org, session

	session.rollback()
	session.close()


@pytest.fixture(scope="function")
def test_app(test_engine, db_setup):
	"""FastAPI app with blocker router, DB and auth overrides."""
	user, org, session = db_setup
	TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

	app = FastAPI()
	app.include_router(router, prefix="/api/v1")

	def override_get_db():
		db = TestingSession()
		try:
			yield db
		finally:
			db.close()

	def override_get_current_user():
		return user

	app.dependency_overrides[get_db] = override_get_db
	app.dependency_overrides[get_current_user] = override_get_current_user

	return app


@pytest.fixture(scope="function")
def client(test_app):
	"""TestClient for making HTTP requests."""
	return TestClient(test_app)


@pytest.fixture
def developer_user(db_setup):
	"""A second user in the org with the Developer scrum role (valid assignee)."""
	user, org, session = db_setup
	dev = User(
		id=uuid4(),
		email="developer@example.com",
		name="Developer User",
		password_hash="hashed_password",
		org_role="member",
		scrum_role="developer",
		organization_id=org.id,
	)
	session.add(dev)
	session.commit()
	session.refresh(dev)
	return dev


@pytest.fixture
def non_developer_user(db_setup):
	"""A user in the org with a non-Developer scrum role (invalid assignee)."""
	user, org, session = db_setup
	sm = User(
		id=uuid4(),
		email="scrummaster@example.com",
		name="Scrum Master",
		password_hash="hashed_password",
		org_role="member",
		scrum_role="scrum_master",
		organization_id=org.id,
	)
	session.add(sm)
	session.commit()
	session.refresh(sm)
	return sm


@pytest.fixture
def sample_blocker(db_setup):
	"""An open blocker in the org, owned by the current user."""
	user, org, session = db_setup
	blocker = Blocker(
		id=uuid4(),
		organization_id=org.id,
		created_by=user.id,
		description="Blocked by missing API key",
		status=BlockerStatus.OPEN,
	)
	session.add(blocker)
	session.commit()
	session.refresh(blocker)
	return blocker


@pytest.fixture
def resolved_blocker(db_setup):
	"""A resolved blocker in the org."""
	user, org, session = db_setup
	blocker = Blocker(
		id=uuid4(),
		organization_id=org.id,
		created_by=user.id,
		description="Already resolved",
		status=BlockerStatus.RESOLVED,
		resolved_at=datetime.now(timezone.utc),
	)
	session.add(blocker)
	session.commit()
	session.refresh(blocker)
	return blocker

"""
Conftest for organization endpoint and service tests.

Sets up:
- Test environment variables (before any app import)
- In-memory SQLite database with manually created tables
- FastAPI TestClient with DB and auth dependency overrides
- Fixtures for users, organizations, and membership data
"""

import os

os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key-for-unit-tests")
os.environ.setdefault("JWT_ALGORITHM", "HS256")
os.environ.setdefault("ACCESS_TOKEN_EXPIRE_MINUTES", "30")

import pytest
from uuid import uuid4
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi import FastAPI
from fastapi.testclient import TestClient

from src.database import get_db
from src.database.models import User, Organization
from src.api.deps import get_current_user
from src.organizations.routes import router


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
			CREATE TABLE IF NOT EXISTS tasks (
				id TEXT PRIMARY KEY,
				title TEXT NOT NULL,
				description TEXT,
				status TEXT NOT NULL DEFAULT 'in_progress',
				created_by TEXT NOT NULL REFERENCES users(id),
				organization_id TEXT NOT NULL REFERENCES organizations(id),
				ticket_id TEXT NOT NULL REFERENCES tickets(id),
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
		conn.execute(text("""
			CREATE TABLE IF NOT EXISTS standups (
				id TEXT PRIMARY KEY,
				organization_id TEXT NOT NULL REFERENCES organizations(id),
				created_by TEXT NOT NULL REFERENCES users(id),
				today TEXT NOT NULL,
				yesterday TEXT,
				blocker_ids TEXT,
				standup_date DATE NOT NULL DEFAULT CURRENT_DATE,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
				updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
				UNIQUE(organization_id, created_by, standup_date)
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
def db_session(test_engine):
	"""Raw session not tied to any user/org. For service-level tests."""
	TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
	session = TestingSession()
	yield session
	session.rollback()
	session.close()


@pytest.fixture(scope="function")
def admin_user(db_session):
	"""
	A user who is NOT yet in any organization.
	Used for create_organization / join tests.
	"""
	user = User(
		id=uuid4(),
		email="admin@example.com",
		name="Admin User",
		password_hash="hashed_password",
	)
	db_session.add(user)
	db_session.commit()
	db_session.refresh(user)
	return user


@pytest.fixture(scope="function")
def org_with_admin(db_session, admin_user):
	"""
	An organization already created, with admin_user as org admin + creator.
	Returns (org, admin_user, session).
	"""
	org = Organization(
		id=uuid4(),
		name="Test Organization",
		join_code="TST-001",
		created_by=admin_user.id,
	)
	db_session.add(org)
	db_session.flush()

	admin_user.organization_id = org.id
	admin_user.org_role = "admin"
	admin_user.scrum_role = "scrum_master"
	db_session.commit()
	db_session.refresh(admin_user)
	db_session.refresh(org)
	return org, admin_user, db_session


@pytest.fixture(scope="function")
def second_user(db_session):
	"""A second user not in any organization."""
	user = User(
		id=uuid4(),
		email="second@example.com",
		name="Second User",
		password_hash="hashed_password",
	)
	db_session.add(user)
	db_session.commit()
	db_session.refresh(user)
	return user


@pytest.fixture(scope="function")
def member_user(db_session, org_with_admin):
	"""A member (developer) in the same org as admin_user."""
	org, admin, session = org_with_admin
	user = User(
		id=uuid4(),
		email="member@example.com",
		name="Member User",
		password_hash="hashed_password",
		organization_id=org.id,
		org_role="member",
		scrum_role="developer",
	)
	session.add(user)
	session.commit()
	session.refresh(user)
	return user


# ── TestClient fixtures (for route tests) ─────────────────────────────

@pytest.fixture(scope="function")
def admin_client(test_engine, org_with_admin):
	"""TestClient authenticated as the org admin."""
	org, admin_user, session = org_with_admin
	TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

	app = FastAPI()
	app.include_router(router)

	def override_get_db():
		db = TestingSession()
		try:
			yield db
		finally:
			db.close()

	def override_get_current_user():
		return admin_user

	app.dependency_overrides[get_db] = override_get_db
	app.dependency_overrides[get_current_user] = override_get_current_user

	return TestClient(app)


@pytest.fixture(scope="function")
def unauthed_user_client(test_engine, db_session, second_user):
	"""TestClient authenticated as a user with NO organization membership."""
	TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

	app = FastAPI()
	app.include_router(router)

	def override_get_db():
		db = TestingSession()
		try:
			yield db
		finally:
			db.close()

	def override_get_current_user():
		return second_user

	app.dependency_overrides[get_db] = override_get_db
	app.dependency_overrides[get_current_user] = override_get_current_user

	return TestClient(app)

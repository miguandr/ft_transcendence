"""
Conftest for analytics endpoint tests.

Sets up:
- In-memory SQLite database with manually created tables
- FastAPI TestClient with DB and auth dependency overrides
- Fixtures for users with and without organizations
"""

import os

os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key-for-unit-tests")
os.environ.setdefault("JWT_ALGORITHM", "HS256")

import pytest
from uuid import uuid4
from datetime import date
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi import FastAPI, Depends
from fastapi.testclient import TestClient

from src.database import get_db
from src.database.models import User
from src.api.deps import get_current_user
from src.analytics.routes import router


def _create_tables(engine):
	"""Create required tables using raw SQL (SQLite-compatible)."""
	with engine.connect() as conn:
		conn.execute(text("""
			CREATE TABLE IF NOT EXISTS organizations (
				id TEXT PRIMARY KEY,
				name TEXT NOT NULL,
				join_code TEXT UNIQUE NOT NULL,
				created_by TEXT NOT NULL,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
				updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
			)
		"""))
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
			CREATE TABLE IF NOT EXISTS standups (
				id TEXT PRIMARY KEY,
				organization_id TEXT NOT NULL,
				created_by TEXT NOT NULL,
				today TEXT NOT NULL,
				yesterday TEXT,
				blocker_ids TEXT,
				standup_date DATE NOT NULL,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
				updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
			)
		"""))
		conn.execute(text("""
			CREATE TABLE IF NOT EXISTS blockers (
				id TEXT PRIMARY KEY,
				organization_id TEXT NOT NULL,
				created_by TEXT NOT NULL,
				assignee_id TEXT,
				description TEXT NOT NULL,
				status TEXT NOT NULL DEFAULT 'open',
				ticket_id TEXT,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
				updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
				resolved_at TIMESTAMP
			)
		"""))
		conn.execute(text("""
			CREATE TABLE IF NOT EXISTS tickets (
				id TEXT PRIMARY KEY,
				organization_id TEXT NOT NULL,
				created_by TEXT NOT NULL,
				assignee_id TEXT,
				title TEXT NOT NULL,
				description TEXT,
				status TEXT NOT NULL DEFAULT 'todo',
				priority TEXT NOT NULL DEFAULT 'medium',
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
				updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
			)
		"""))
		conn.execute(text("""
			CREATE TABLE IF NOT EXISTS tasks (
				id TEXT PRIMARY KEY,
				organization_id TEXT NOT NULL,
				created_by TEXT NOT NULL,
				assignee_id TEXT,
				ticket_id TEXT NOT NULL,
				title TEXT NOT NULL,
				description TEXT,
				status TEXT NOT NULL DEFAULT 'in_progress',
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
				updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
			)
		"""))
		conn.commit()


@pytest.fixture(scope="function")
def test_engine():
	engine = create_engine(
		"sqlite:///:memory:",
		connect_args={"check_same_thread": False},
		poolclass=StaticPool,
	)
	_create_tables(engine)
	yield engine


@pytest.fixture(scope="function")
def db_setup(test_engine):
	"""Creates an organization and a user that belongs to it."""
	TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
	session = TestingSession()

	org_id = uuid4()
	user_id = uuid4()

	session.execute(text("""
		INSERT INTO organizations (id, name, join_code, created_by)
		VALUES (:id, :name, :join_code, :created_by)
	"""), {"id": str(org_id), "name": "Test Org", "join_code": "TESTCODE1", "created_by": str(user_id)})

	user = User(
		id=user_id,
		email="test@example.com",
		name="Test User",
		password_hash="hashed_password",
		organization_id=org_id,
	)
	session.add(user)
	session.commit()
	session.refresh(user)

	yield user, session, org_id

	session.rollback()
	session.close()


@pytest.fixture(scope="function")
def db_setup_no_org(test_engine):
	"""Creates a user without an organization."""
	TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
	session = TestingSession()

	user = User(
		id=uuid4(),
		email="noorg@example.com",
		name="No Org User",
		password_hash="hashed_password",
	)
	session.add(user)
	session.commit()
	session.refresh(user)

	yield user, session

	session.rollback()
	session.close()


def _make_app(test_engine, user):
	"""Create a FastAPI test app with analytics router."""
	TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

	app = FastAPI()
	app.include_router(router)

	def override_get_db():
		db = TestingSession()
		try:
			yield db
		finally:
			db.close()

	def override_get_current_user(db: Session = Depends(get_db)):
		return db.query(User).filter(User.id == user.id).first()

	app.dependency_overrides[get_db] = override_get_db
	app.dependency_overrides[get_current_user] = override_get_current_user

	return app


@pytest.fixture(scope="function")
def client(test_engine, db_setup):
	user, session, org_id = db_setup
	app = _make_app(test_engine, user)
	return TestClient(app)


@pytest.fixture(scope="function")
def client_no_org(test_engine, db_setup_no_org):
	user, session = db_setup_no_org
	app = _make_app(test_engine, user)
	return TestClient(app)

"""
Conftest for dashboard endpoint tests.

Sets up:
- In-memory SQLite database via Base.metadata.create_all
- FastAPI TestClient with DB and auth dependency overrides
- Fixtures for: user with matching org, user with no org, user with different org
"""

import os

os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key-for-unit-tests")
os.environ.setdefault("JWT_ALGORITHM", "HS256")
os.environ.setdefault("ACCESS_TOKEN_EXPIRE_MINUTES", "30")

import pytest
from uuid import uuid4
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi import FastAPI, Depends
from fastapi.testclient import TestClient

from src.database import get_db
from src.database.base import Base
from src.database.models import User, Organization
from src.api.deps import get_current_user
from src.dashboard.routes import router


@pytest.fixture(scope="function")
def test_engine():
	engine = create_engine(
		"sqlite:///:memory:",
		connect_args={"check_same_thread": False},
		poolclass=StaticPool,
	)
	Base.metadata.create_all(bind=engine)
	yield engine
	Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db_setup(test_engine):
	"""Creates an organization and a user that belongs to it."""
	TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
	session = TestingSession()

	user_id = uuid4()
	org_id = uuid4()

	user = User(
		id=user_id,
		email="test@example.com",
		name="Test User",
		password_hash="hashed_password",
	)
	session.add(user)
	session.commit()

	org = Organization(
		id=org_id,
		name="Test Org",
		join_code="DASHCODE1",
		created_by=user_id,
	)
	session.add(org)
	session.commit()

	user.organization_id = org_id
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


@pytest.fixture(scope="function")
def db_setup_different_org(test_engine):
	"""Creates an org in DB and a user belonging to a DIFFERENT org."""
	TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
	session = TestingSession()

	creator_id = uuid4()
	org_id = uuid4()

	creator = User(
		id=creator_id,
		email="creator@example.com",
		name="Creator",
		password_hash="hashed_password",
	)
	session.add(creator)
	session.commit()

	org = Organization(
		id=org_id,
		name="The Org",
		join_code="DASHCODE2",
		created_by=creator_id,
	)
	session.add(org)
	session.commit()

	# User belongs to a different org (not in DB — SQLite won't enforce FK by default)
	user = User(
		id=uuid4(),
		email="other@example.com",
		name="Other User",
		password_hash="hashed_password",
		organization_id=uuid4(),
	)
	session.add(user)
	session.commit()
	session.refresh(user)

	yield user, session, org_id

	session.rollback()
	session.close()


def _make_app(test_engine, user):
	"""Create a FastAPI test app with dashboard router."""
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
def client_different_org(test_engine, db_setup_different_org):
	user, session, org_id = db_setup_different_org
	app = _make_app(test_engine, user)
	return TestClient(app)

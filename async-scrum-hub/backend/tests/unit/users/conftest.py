"""
Conftest for user endpoint tests.

Sets up:
- Test environment variables (before any app import)
- In-memory SQLite database with manually created tables
- FastAPI TestClient with DB and auth dependency overrides
- Fixtures for user data and test images
"""

import os

os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key-for-unit-tests")
os.environ.setdefault("JWT_ALGORITHM", "HS256")
os.environ.setdefault("ACCESS_TOKEN_EXPIRE_MINUTES", "30")

import pytest
from uuid import uuid4
from io import BytesIO
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi import FastAPI, Depends
from fastapi.testclient import TestClient

from src.database import get_db
from src.database.models import User
from src.api.deps import get_current_user
from src.users.routes import router


def _create_tables(engine):
	"""Create required tables using raw SQL."""
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
		conn.commit()


@pytest.fixture(scope="function")
def test_engine():
	"""In-memory SQLite database with users table."""
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
	Creates a user in the DB.
	Returns (user, session).
	"""
	TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
	session = TestingSession()

	user = User(
		id=uuid4(),
		email="test@example.com",
		name="Test User",
		password_hash="hashed_password",
	)
	session.add(user)
	session.commit()
	session.refresh(user)

	yield user, session

	session.rollback()
	session.close()


@pytest.fixture(scope="function")
def test_app(test_engine, db_setup):
	"""FastAPI app with users router, DB and auth overrides."""
	user, session = db_setup
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
		"""
		Queries the test user from the same session as the route.
		This ensures user_update(db, current_user, ...) works correctly
		since both db and current_user are from the same session.
		"""
		return db.query(User).filter(User.id == user.id).first()

	app.dependency_overrides[get_db] = override_get_db
	app.dependency_overrides[get_current_user] = override_get_current_user

	return app


@pytest.fixture(scope="function")
def client(test_app):
	"""TestClient for making HTTP requests."""
	return TestClient(test_app)


@pytest.fixture
def sample_png():
	"""Minimal 1x1 pixel PNG image as bytes."""
	from PIL import Image
	buf = BytesIO()
	img = Image.new("RGB", (1, 1), color=(255, 0, 0))
	img.save(buf, format="PNG")
	buf.seek(0)
	return buf.read()

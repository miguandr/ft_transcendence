"""
Conftest for auth endpoint tests.

Sets up:
- Test environment variables (before any app import)
- In-memory SQLite database
- FastAPI TestClient with DB dependency override
"""

import os

os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key-for-unit-tests")
os.environ.setdefault("JWT_ALGORITHM", "HS256")
os.environ.setdefault("ACCESS_TOKEN_EXPIRE_MINUTES", "30")

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi import FastAPI
from fastapi.testclient import TestClient

from src.database.base import Base
from src.database import get_db
from src.database.models.user import User
from src.auth.routes import router


@pytest.fixture(scope="function")
def test_db():
    """Create in-memory SQLite DB and return engine + session factory."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    User.__table__.create(bind=engine)
    TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    yield engine, TestingSession
    User.__table__.drop(bind=engine)


@pytest.fixture(scope="function")
def test_app(test_db):
    """Create a FastAPI app with auth router and test DB."""
    _, TestingSession = test_db

    app = FastAPI()
    app.include_router(router, prefix="/auth")

    def override_get_db():
        db = TestingSession()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    return app


@pytest.fixture(scope="function")
def db_session(test_db):
    """Expose the test DB session for direct manipulation."""
    _, TestingSession = test_db
    db = TestingSession()
    yield db
    db.close()


@pytest.fixture(scope="function")
def client(test_app):
    """TestClient for making HTTP requests."""
    return TestClient(test_app)

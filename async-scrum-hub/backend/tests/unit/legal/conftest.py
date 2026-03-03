"""
Conftest for legal endpoint tests.

Sets up:
- FastAPI TestClient with legal router
- Fixtures that patch LEGAL_DIR to a temp directory with/without files
"""

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

import src.legal.routes as legal_routes
from src.legal.routes import router


@pytest.fixture(scope="function")
def legal_client(tmp_path, monkeypatch):
	"""TestClient with temp legal dir containing both documents."""
	(tmp_path / "privacy.md").write_text("# Privacy Policy\nThis is the privacy content.")
	(tmp_path / "terms.md").write_text("# Terms of Service\nThese are the terms.")

	monkeypatch.setattr(legal_routes, "LEGAL_DIR", str(tmp_path))

	app = FastAPI()
	app.include_router(router)
	return TestClient(app)


@pytest.fixture(scope="function")
def legal_client_no_files(tmp_path, monkeypatch):
	"""TestClient with temp legal dir where the files don't exist."""
	monkeypatch.setattr(legal_routes, "LEGAL_DIR", str(tmp_path))

	app = FastAPI()
	app.include_router(router)
	return TestClient(app)

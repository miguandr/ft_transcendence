"""
Unit tests for the legal module (schemas, routes).

Tests cover:
- Schema validation (LegalDocumentResponse)
- Route endpoint via TestClient (GET /legal/documents/{key})

To run:
    docker-compose exec backend pytest tests/unit/legal/ -v --tb=long
"""

import pytest

from src.legal.schemas import LegalDocumentResponse


LEGAL_URL = "/legal/documents/{key}"


# ---------------------------------------------------------------------------
# Schema tests
# ---------------------------------------------------------------------------

class TestLegalSchemas:

	def test_legal_document_response(self):
		doc = LegalDocumentResponse(
			key="privacy",
			title="Privacy Policy",
			content="Some content",
			updated_at="2024-01-01T00:00:00+00:00",
		)
		assert doc.key == "privacy"
		assert doc.title == "Privacy Policy"
		assert doc.content == "Some content"
		assert doc.updated_at == "2024-01-01T00:00:00+00:00"


# ---------------------------------------------------------------------------
# Route tests
# ---------------------------------------------------------------------------

class TestLegalRoute:

	def test_returns_200_for_privacy(self, legal_client):
		"""Returns 200 OK for key='privacy'."""
		response = legal_client.get(LEGAL_URL.format(key="privacy"))
		assert response.status_code == 200

	def test_returns_200_for_terms(self, legal_client):
		"""Returns 200 OK for key='terms'."""
		response = legal_client.get(LEGAL_URL.format(key="terms"))
		assert response.status_code == 200

	def test_returns_404_for_invalid_key(self, legal_client):
		"""Returns 404 when the key is not a known document."""
		response = legal_client.get(LEGAL_URL.format(key="unknown"))
		assert response.status_code == 404
		assert response.json()["detail"]["error"]["code"] == "NOT_FOUND"

	def test_returns_404_when_file_missing(self, legal_client_no_files):
		"""Returns 404 when the key is valid but the file doesn't exist on disk."""
		response = legal_client_no_files.get(LEGAL_URL.format(key="privacy"))
		assert response.status_code == 404
		assert response.json()["detail"]["error"]["code"] == "NOT_FOUND"

	def test_response_has_all_fields(self, legal_client):
		"""Response contains key, title, content, updated_at."""
		data = legal_client.get(LEGAL_URL.format(key="privacy")).json()
		assert "key" in data
		assert "title" in data
		assert "content" in data
		assert "updated_at" in data

	def test_response_key_matches_requested(self, legal_client):
		"""Response key matches the requested key."""
		data = legal_client.get(LEGAL_URL.format(key="privacy")).json()
		assert data["key"] == "privacy"

	def test_response_title_for_privacy(self, legal_client):
		"""Privacy document returns the correct title."""
		data = legal_client.get(LEGAL_URL.format(key="privacy")).json()
		assert data["title"] == "Privacy Policy"

	def test_response_title_for_terms(self, legal_client):
		"""Terms document returns the correct title."""
		data = legal_client.get(LEGAL_URL.format(key="terms")).json()
		assert data["title"] == "Terms of Service"

	def test_response_content_matches_file(self, legal_client):
		"""Content in response matches the file content."""
		data = legal_client.get(LEGAL_URL.format(key="privacy")).json()
		assert data["content"] == "# Privacy Policy\nThis is the privacy content."

	def test_response_updated_at_is_string(self, legal_client):
		"""updated_at is a non-empty string."""
		data = legal_client.get(LEGAL_URL.format(key="privacy")).json()
		assert isinstance(data["updated_at"], str)
		assert len(data["updated_at"]) > 0

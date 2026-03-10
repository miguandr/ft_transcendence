"""
Unit tests for security utilities (JWT + password hashing).

Tests cover:
- JWT token creation and decoding round-trip
- JWT token contains correct claims (sub, exp)
- Expired tokens are rejected
- Tampered/invalid tokens are rejected
- Password hashing produces a valid bcrypt hash
- Password verification succeeds with correct password
- Password verification fails with wrong password
- Empty inputs to verify_password return False

to run:
docker-compose exec backend pytest tests/unit/config/test_security.py -v --tb=long
"""

import pytest
from uuid import uuid4
from datetime import datetime, timedelta, timezone
from unittest.mock import patch
from jose import jwt
from fastapi import HTTPException

from src.config.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
    JWT_SECRET_KEY,
    JWT_ALGORITHM,
)

class TestCreateAccessToken:
    """Tests for create_access_token."""

    def test_returns_string(self):
        """Token should be a non-empty string."""
        token = create_access_token("user-id")
        assert isinstance(token, str)
        assert len(token) > 0

    def test_token_contains_sub_claim(self):
        """Token payload should include the subject."""
        user_id = str(uuid4())
        token = create_access_token(user_id)
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        assert payload["sub"] == user_id

    def test_token_contains_exp_claim(self):
        """Token payload should include an expiration timestamp."""
        token = create_access_token("user-id")
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        assert "exp" in payload

    def test_accepts_uuid_subject(self):
        """Should accept a UUID object and store it as string."""
        user_uuid = uuid4()
        token = create_access_token(user_uuid)
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        assert payload["sub"] == str(user_uuid)


class TestDecodeAccessToken:
    """Tests for decode_access_token."""

    def test_round_trip(self):
        """A token created by create_access_token should be decodable."""
        user_id = str(uuid4())
        token = create_access_token(user_id)
        payload = decode_access_token(token)
        assert payload["sub"] == user_id

    def test_invalid_token_raises_401(self):
        """A garbage token should raise HTTP 401."""
        with pytest.raises(HTTPException) as exc_info:
            decode_access_token("not.a.valid.token")
        assert exc_info.value.status_code == 401

    def test_tampered_token_raises_401(self):
        """A token signed with a different key should raise HTTP 401."""
        payload = {"sub": "user-id", "exp": datetime.now(timezone.utc) + timedelta(minutes=30)}
        bad_token = jwt.encode(payload, "wrong-secret-key", algorithm=JWT_ALGORITHM)
        with pytest.raises(HTTPException) as exc_info:
            decode_access_token(bad_token)
        assert exc_info.value.status_code == 401

    def test_expired_token_raises_401(self):
        """An expired token should raise HTTP 401."""
        payload = {"sub": "user-id", "exp": datetime.now(timezone.utc) - timedelta(minutes=1)}
        expired_token = jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
        with pytest.raises(HTTPException) as exc_info:
            decode_access_token(expired_token)
        assert exc_info.value.status_code == 401


class TestHashPassword:
    """Tests for hash_password."""

    def test_returns_string(self):
        """Hash should be a non-empty string."""
        hashed = hash_password("mypassword")
        assert isinstance(hashed, str)
        assert len(hashed) > 0

    def test_hash_differs_from_plain(self):
        """Hash should not equal the plain password."""
        plain = "mypassword"
        hashed = hash_password(plain)
        assert hashed != plain

    def test_hash_is_bcrypt_format(self):
        """Bcrypt hashes start with $2b$."""
        hashed = hash_password("mypassword")
        assert hashed.startswith("$2b$")

    def test_same_password_produces_different_hashes(self):
        """Two hashes of the same password should differ (random salt)."""
        hash1 = hash_password("mypassword")
        hash2 = hash_password("mypassword")
        assert hash1 != hash2


class TestVerifyPassword:
    """Tests for verify_password."""

    def test_correct_password_returns_true(self):
        """Verification should succeed with the correct password."""
        plain = "mypassword"
        hashed = hash_password(plain)
        assert verify_password(plain, hashed) is True

    def test_wrong_password_returns_false(self):
        """Verification should fail with an incorrect password."""
        hashed = hash_password("mypassword")
        assert verify_password("wrongpassword", hashed) is False

    def test_empty_plain_password_returns_false(self):
        """Empty plain password should return False."""
        hashed = hash_password("mypassword")
        assert verify_password("", hashed) is False

    def test_empty_stored_hash_returns_false(self):
        """Empty stored hash should return False."""
        assert verify_password("mypassword", "") is False

    def test_both_empty_returns_false(self):
        """Both empty should return False."""
        assert verify_password("", "") is False

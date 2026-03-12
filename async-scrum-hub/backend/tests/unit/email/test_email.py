"""
Unit tests for src/config/email.py

Tests cover:
- _smtp_configured(): returns True/False based on settings
- send_invite_email(): skips silently when SMTP not configured
- send_invite_email(): builds and sends the correct email when SMTP is configured
- send_invite_email(): uses SMTP_USER as From when SMTP_FROM_EMAIL is not set
- send_invite_email(): swallows exceptions so the invite flow never breaks

The test recipient email is justspamandegg@gmail.com (test account).

To run:
    docker-compose exec backend pytest tests/unit/email/ -v --tb=long
"""

import smtplib
from unittest.mock import MagicMock, patch

import pytest


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

TEST_TO_EMAIL = "justspamandegg@gmail.com"
TEST_TO_NAME = "Test User"
TEST_ORG_NAME = "Async Scrum Hub"
TEST_JOIN_CODE = "ABC-123"


def _patch_settings(**kwargs):
	"""Return a mock settings object with SMTP fields set from kwargs."""
	mock = MagicMock()
	mock.smtp_host = kwargs.get("smtp_host", "smtp.gmail.com")
	mock.smtp_port = kwargs.get("smtp_port", 587)
	mock.smtp_user = kwargs.get("smtp_user", "justspamandegg@gmail.com")
	mock.smtp_password = kwargs.get("smtp_password", "wxhd chxp uumx qqns")
	mock.smtp_from_email = kwargs.get("smtp_from_email", "Async Scrum Hub")
	return mock


# ---------------------------------------------------------------------------
# _smtp_configured
# ---------------------------------------------------------------------------

class TestSmtpConfigured:
	"""Tests for the _smtp_configured() helper."""

	def test_returns_true_when_all_fields_present(self):
		"""Returns True when host, user and password are all set."""
		mock_settings = _patch_settings()
		with patch("src.config.email.settings", mock_settings):
			from src.config.email import _smtp_configured
			assert _smtp_configured() is True

	def test_returns_false_when_host_missing(self):
		"""Returns False when smtp_host is None."""
		mock_settings = _patch_settings(smtp_host=None)
		with patch("src.config.email.settings", mock_settings):
			from src.config.email import _smtp_configured
			assert _smtp_configured() is False

	def test_returns_false_when_user_missing(self):
		"""Returns False when smtp_user is None."""
		mock_settings = _patch_settings(smtp_user=None)
		with patch("src.config.email.settings", mock_settings):
			from src.config.email import _smtp_configured
			assert _smtp_configured() is False

	def test_returns_false_when_password_missing(self):
		"""Returns False when smtp_password is None."""
		mock_settings = _patch_settings(smtp_password=None)
		with patch("src.config.email.settings", mock_settings):
			from src.config.email import _smtp_configured
			assert _smtp_configured() is False

	def test_returns_false_when_all_fields_missing(self):
		"""Returns False when all SMTP fields are None."""
		mock_settings = _patch_settings(smtp_host=None, smtp_user=None, smtp_password=None)
		with patch("src.config.email.settings", mock_settings):
			from src.config.email import _smtp_configured
			assert _smtp_configured() is False


# ---------------------------------------------------------------------------
# send_invite_email — SMTP not configured
# ---------------------------------------------------------------------------

class TestSendInviteEmailNotConfigured:
	"""send_invite_email silently skips when SMTP is not configured."""

	def test_skips_when_host_missing(self):
		"""Does not raise and does not open an SMTP connection."""
		mock_settings = _patch_settings(smtp_host=None)
		with patch("src.config.email.settings", mock_settings):
			with patch("smtplib.SMTP") as mock_smtp:
				from src.config.email import send_invite_email
				send_invite_email(TEST_TO_EMAIL, TEST_TO_NAME, TEST_ORG_NAME, TEST_JOIN_CODE)
				mock_smtp.assert_not_called()

	def test_skips_when_user_missing(self):
		"""Does not raise and does not open an SMTP connection."""
		mock_settings = _patch_settings(smtp_user=None)
		with patch("src.config.email.settings", mock_settings):
			with patch("smtplib.SMTP") as mock_smtp:
				from src.config.email import send_invite_email
				send_invite_email(TEST_TO_EMAIL, TEST_TO_NAME, TEST_ORG_NAME, TEST_JOIN_CODE)
				mock_smtp.assert_not_called()

	def test_returns_none_when_not_configured(self):
		"""Return value is None (no exception) when SMTP is missing."""
		mock_settings = _patch_settings(smtp_host=None)
		with patch("src.config.email.settings", mock_settings):
			from src.config.email import send_invite_email
			result = send_invite_email(TEST_TO_EMAIL, TEST_TO_NAME, TEST_ORG_NAME, TEST_JOIN_CODE)
			assert result is None


# ---------------------------------------------------------------------------
# send_invite_email — SMTP configured, happy path
# ---------------------------------------------------------------------------

class TestSendInviteEmailConfigured:
	"""send_invite_email sends the correct email when SMTP is configured."""

	def _make_mock_smtp(self):
		"""Return a context-manager-compatible SMTP mock."""
		mock_server = MagicMock()
		mock_smtp_cls = MagicMock()
		mock_smtp_cls.return_value.__enter__ = MagicMock(return_value=mock_server)
		mock_smtp_cls.return_value.__exit__ = MagicMock(return_value=False)
		return mock_smtp_cls, mock_server

	def test_opens_smtp_connection_to_correct_host_and_port(self):
		"""Opens SMTP connection using configured host and port."""
		mock_settings = _patch_settings()
		mock_smtp_cls, mock_server = self._make_mock_smtp()

		with patch("src.config.email.settings", mock_settings):
			with patch("src.config.email.smtplib.SMTP", mock_smtp_cls):
				from src.config.email import send_invite_email
				send_invite_email(TEST_TO_EMAIL, TEST_TO_NAME, TEST_ORG_NAME, TEST_JOIN_CODE)

		mock_smtp_cls.assert_called_once_with("smtp.gmail.com", 587)

	def test_calls_starttls(self):
		"""Upgrades connection to TLS via starttls."""
		mock_settings = _patch_settings()
		mock_smtp_cls, mock_server = self._make_mock_smtp()

		with patch("src.config.email.settings", mock_settings):
			with patch("src.config.email.smtplib.SMTP", mock_smtp_cls):
				from src.config.email import send_invite_email
				send_invite_email(TEST_TO_EMAIL, TEST_TO_NAME, TEST_ORG_NAME, TEST_JOIN_CODE)

		mock_server.starttls.assert_called_once()

	def test_logs_in_with_correct_credentials(self):
		"""Logs in using smtp_user and smtp_password from settings."""
		mock_settings = _patch_settings()
		mock_smtp_cls, mock_server = self._make_mock_smtp()

		with patch("src.config.email.settings", mock_settings):
			with patch("src.config.email.smtplib.SMTP", mock_smtp_cls):
				from src.config.email import send_invite_email
				send_invite_email(TEST_TO_EMAIL, TEST_TO_NAME, TEST_ORG_NAME, TEST_JOIN_CODE)

		mock_server.login.assert_called_once_with(
			"justspamandegg@gmail.com",
			"wxhd chxp uumx qqns",
		)

	def test_sends_to_correct_recipient(self):
		"""Calls sendmail with the expected recipient address."""
		mock_settings = _patch_settings()
		mock_smtp_cls, mock_server = self._make_mock_smtp()

		with patch("src.config.email.settings", mock_settings):
			with patch("src.config.email.smtplib.SMTP", mock_smtp_cls):
				from src.config.email import send_invite_email
				send_invite_email(TEST_TO_EMAIL, TEST_TO_NAME, TEST_ORG_NAME, TEST_JOIN_CODE)

		args = mock_server.sendmail.call_args
		# sendmail(from, [to], message)
		assert args[0][1] == [TEST_TO_EMAIL]

	def test_email_subject_contains_org_name(self):
		"""The email subject includes the organization name."""
		mock_settings = _patch_settings()
		mock_smtp_cls, mock_server = self._make_mock_smtp()

		with patch("src.config.email.settings", mock_settings):
			with patch("src.config.email.smtplib.SMTP", mock_smtp_cls):
				from src.config.email import send_invite_email
				send_invite_email(TEST_TO_EMAIL, TEST_TO_NAME, TEST_ORG_NAME, TEST_JOIN_CODE)

		raw_message = mock_server.sendmail.call_args[0][2]
		assert TEST_ORG_NAME in raw_message

	def test_email_body_contains_join_code(self):
		"""The email body includes the join code."""
		import email as email_lib
		mock_settings = _patch_settings()
		mock_smtp_cls, mock_server = self._make_mock_smtp()

		with patch("src.config.email.settings", mock_settings):
			with patch("src.config.email.smtplib.SMTP", mock_smtp_cls):
				from src.config.email import send_invite_email
				send_invite_email(TEST_TO_EMAIL, TEST_TO_NAME, TEST_ORG_NAME, TEST_JOIN_CODE)

		raw_message = mock_server.sendmail.call_args[0][2]
		msg = email_lib.message_from_string(raw_message)
		body = "".join(
			part.get_payload(decode=True).decode("utf-8")
			for part in msg.walk()
			if part.get_content_type() in ("text/plain", "text/html")
		)
		assert TEST_JOIN_CODE in body

	def test_email_body_contains_recipient_name(self):
		"""The email body greets the recipient by name."""
		import email as email_lib
		mock_settings = _patch_settings()
		mock_smtp_cls, mock_server = self._make_mock_smtp()

		with patch("src.config.email.settings", mock_settings):
			with patch("src.config.email.smtplib.SMTP", mock_smtp_cls):
				from src.config.email import send_invite_email
				send_invite_email(TEST_TO_EMAIL, TEST_TO_NAME, TEST_ORG_NAME, TEST_JOIN_CODE)

		raw_message = mock_server.sendmail.call_args[0][2]
		msg = email_lib.message_from_string(raw_message)
		body = "".join(
			part.get_payload(decode=True).decode("utf-8")
			for part in msg.walk()
			if part.get_content_type() in ("text/plain", "text/html")
		)
		assert TEST_TO_NAME in body

	def test_uses_smtp_from_email_as_sender(self):
		"""Uses smtp_from_email as the From address when it is set."""
		mock_settings = _patch_settings(smtp_from_email="Async Scrum Hub")
		mock_smtp_cls, mock_server = self._make_mock_smtp()

		with patch("src.config.email.settings", mock_settings):
			with patch("src.config.email.smtplib.SMTP", mock_smtp_cls):
				from src.config.email import send_invite_email
				send_invite_email(TEST_TO_EMAIL, TEST_TO_NAME, TEST_ORG_NAME, TEST_JOIN_CODE)

		args = mock_server.sendmail.call_args
		assert args[0][0] == "Async Scrum Hub"

	def test_falls_back_to_smtp_user_when_from_email_not_set(self):
		"""Falls back to smtp_user as sender when smtp_from_email is None."""
		mock_settings = _patch_settings(smtp_from_email=None)
		mock_smtp_cls, mock_server = self._make_mock_smtp()

		with patch("src.config.email.settings", mock_settings):
			with patch("src.config.email.smtplib.SMTP", mock_smtp_cls):
				from src.config.email import send_invite_email
				send_invite_email(TEST_TO_EMAIL, TEST_TO_NAME, TEST_ORG_NAME, TEST_JOIN_CODE)

		args = mock_server.sendmail.call_args
		assert args[0][0] == "justspamandegg@gmail.com"


# ---------------------------------------------------------------------------
# send_invite_email — error handling
# ---------------------------------------------------------------------------

class TestSendInviteEmailErrorHandling:
	"""send_invite_email swallows SMTP exceptions so the invite flow never breaks."""

	def test_does_not_raise_on_smtp_exception(self):
		"""An SMTP error is logged but not re-raised."""
		mock_settings = _patch_settings()
		mock_smtp_cls = MagicMock()
		mock_smtp_cls.return_value.__enter__ = MagicMock(
			side_effect=smtplib.SMTPException("connection refused")
		)
		mock_smtp_cls.return_value.__exit__ = MagicMock(return_value=False)

		with patch("src.config.email.settings", mock_settings):
			with patch("src.config.email.smtplib.SMTP", mock_smtp_cls):
				from src.config.email import send_invite_email
				# Should not raise
				send_invite_email(TEST_TO_EMAIL, TEST_TO_NAME, TEST_ORG_NAME, TEST_JOIN_CODE)

	def test_does_not_raise_on_auth_error(self):
		"""An authentication error is swallowed."""
		mock_settings = _patch_settings()
		mock_server = MagicMock()
		mock_server.login.side_effect = smtplib.SMTPAuthenticationError(535, b"bad credentials")
		mock_smtp_cls = MagicMock()
		mock_smtp_cls.return_value.__enter__ = MagicMock(return_value=mock_server)
		mock_smtp_cls.return_value.__exit__ = MagicMock(return_value=False)

		with patch("src.config.email.settings", mock_settings):
			with patch("src.config.email.smtplib.SMTP", mock_smtp_cls):
				from src.config.email import send_invite_email
				send_invite_email(TEST_TO_EMAIL, TEST_TO_NAME, TEST_ORG_NAME, TEST_JOIN_CODE)

	def test_does_not_raise_on_send_failure(self):
		"""A failure during sendmail is swallowed."""
		mock_settings = _patch_settings()
		mock_server = MagicMock()
		mock_server.sendmail.side_effect = smtplib.SMTPRecipientsRefused({})
		mock_smtp_cls = MagicMock()
		mock_smtp_cls.return_value.__enter__ = MagicMock(return_value=mock_server)
		mock_smtp_cls.return_value.__exit__ = MagicMock(return_value=False)

		with patch("src.config.email.settings", mock_settings):
			with patch("src.config.email.smtplib.SMTP", mock_smtp_cls):
				from src.config.email import send_invite_email
				send_invite_email(TEST_TO_EMAIL, TEST_TO_NAME, TEST_ORG_NAME, TEST_JOIN_CODE)

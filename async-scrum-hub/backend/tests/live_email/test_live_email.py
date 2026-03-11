"""
Live email tests — these send REAL emails over SMTP.

These tests are NOT mocked. They connect to smtp.gmail.com and deliver
an actual email to justspamandegg@gmail.com using the credentials
configured in docker-compose.yml.

Run explicitly with:
    docker compose exec backend pytest tests/live_email/ -v -m live_email

They are excluded from the default test run (pytest.ini does not include
live_email in the default addopts) so they never fire in CI accidentally.
"""

import pytest

RECIPIENT_EMAIL = "justspamandegg@gmail.com"
RECIPIENT_NAME = "Spam & Egg"
ORG_NAME = "Async Scrum Hub"
JOIN_CODE = "TST-001"


@pytest.mark.live_email
class TestLiveSendInviteEmail:
    """Send real invite emails to justspamandegg@gmail.com."""

    def test_send_invite_email_delivers_successfully(self):
        """Sends a real invite email and expects no exception to be raised."""
        from src.config.email import send_invite_email

        # Will raise if SMTP handshake or auth fails
        send_invite_email(
            to_email=RECIPIENT_EMAIL,
            to_name=RECIPIENT_NAME,
            organization_name=ORG_NAME,
            join_code=JOIN_CODE,
        )

    def test_send_invite_email_with_different_join_code(self):
        """Sends a second invite with a different join code."""
        from src.config.email import send_invite_email

        send_invite_email(
            to_email=RECIPIENT_EMAIL,
            to_name=RECIPIENT_NAME,
            organization_name=ORG_NAME,
            join_code="XYZ-789",
        )

    def test_send_invite_email_with_long_org_name(self):
        """Sends an invite for an org with a long name — checks body construction."""
        from src.config.email import send_invite_email

        send_invite_email(
            to_email=RECIPIENT_EMAIL,
            to_name=RECIPIENT_NAME,
            organization_name="A Very Long Organization Name That Tests Formatting",
            join_code=JOIN_CODE,
        )

"""
Conftest for config unit tests.

Sets required environment variables BEFORE any config module is imported,
so that Settings() can be instantiated without a real .env file.
"""

import os

os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key-for-unit-tests")
os.environ.setdefault("JWT_ALGORITHM", "HS256")
os.environ.setdefault("ACCESS_TOKEN_EXPIRE_MINUTES", "30")

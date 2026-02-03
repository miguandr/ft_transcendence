"""
Security utilities (JWT + hashing).

This module centralizes:
- JWT decoding/validation for protected endpoints (decode_access_token)
- JWT creation for login (create_access_token)  [TODO --> POST /api/v1/auth/login]
- Password hashing utilities                    [TOFO --> POST /api/v1/auth/register]

Environment variables:
- JWT_SECRET_KEY (required)
- JWT_ALGORITHM (optional, defaults to HS256)
"""

import os
from jose import jwt, JWTError
from fastapi import HTTPException, status

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256") #if not provided --> HS256 default

if not JWT_SECRET_KEY:
	raise RuntimeError("Missing required env var: JWT_SECRET_KEY")

"""
Decodes and validates a JWT access token.
Returns the payload dict if valid; raises 401 if invalid/expired.
"""
def decode_access_token(token: str) -> dict:
	try:
		payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
		return payload
	except JWTError:
		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
	

from sqlalchemy.orm import Session
from fastapi import HTTPException, status, Depends

from src.database.models import User
from src.api.deps import get_current_user
from src.config.security import hash_password, verify_password, create_access_token
from src.auth.schemas import LoginResponse


def register_user(db: Session, email: str, name: str, password: str) -> User:
	existing = db.query(User).filter(User.email == email).first()
	if existing:
		raise HTTPException(
			status_code=status.HTTP_409_CONFLICT,
			detail={"error": {"code": "USER_EXISTS", "message": "User with this email already exists"}},
		)
	user = User(email=email, name=name, password_hash=hash_password(password))
	db.add(user)
	db.commit()
	db.refresh(user)
	return user # ORM object


def login_user(db: Session, email: str, password: str) -> LoginResponse:
	
	user = db.query(User).filter(User.email == email).first()	
	if not user or not verify_password(password, user.password_hash):
		raise HTTPException(
			status_code=status.HTTP_401_UNAUTHORIZED,
			detail={"error": {"code": "INVALID_CREDENTIALS", "message": "Email or password is incorrect"}},
		)
	
	if not user.organization_id:
		raise HTTPException(
			status_code=status.HTTP_403_FORBIDDEN,
			detail={"error": {"code": "TEAM_SETUP_NOT_DONE", "message": "Team setup is not done"}},
		)			
	
	token = create_access_token(user.id)
	return LoginResponse(access_token=token, token_type="bearer")

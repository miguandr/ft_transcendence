from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.database import get_db
from src.database.models import User
from src.config.security import hash_password, verify_password, create_access_token
from src.auth.schemas import RegisterRequest, RegisterResponse, LoginRequest, LoginResponse

router = APIRouter()

@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
	existing_user = db.query(User).filter(User.email == body.email).first()
	if existing_user:
		raise HTTPException(
			status_code=status.HTTP_409_CONFLICT,
			detail={
				"error": {
					"code": "USER_EXISTS", 
					"message": "User with this email already exists"
				}
			},
		)

	user = User(
		email=body.email,
		name=body.name,
		password_hash=hash_password(body.password),
	)
	db.add(user)
	db.commit()
	db.refresh(user)

	return user


@router.post("/login", response_model=LoginResponse, status_code=status.HTTP_200_OK)
def login(body: LoginRequest, db: Session = Depends(get_db)):
	existing_user = db.query(User).filter(User.email == body.email).first()
	if not existing_user or not verify_password(body.password, existing_user.password_hash):
		raise HTTPException(
			status_code=status.HTTP_401_UNAUTHORIZED,
			detail={
				"error": {
					"code": "INVALID_CREDENTIALS", 
					"message": "Email or password is incorrect"
				}
			},
		)

	token = create_access_token(existing_user.id)
	return LoginResponse(access_token=token, token_type="bearer")

from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ....core.database import get_db
from ....core.config import settings
from ....core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from ....models.user import User
from ....models.request import EmployeeRequest
from ....schemas.auth import (
    UserCreate,
    LoginRequest,
    UserResponse,
    TokenResponse,
    TokenRefreshRequest,
)

router = APIRouter()

@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists."
        )

    # Check if this is the first user in the database to bootstrap SUPER_ADMIN
    is_first_user = db.query(User).count() == 0
    role = "SUPER_ADMIN" if is_first_user else "EMPLOYEE"

    # Create new user
    hashed_pwd = hash_password(user_in.password)
    user = User(
        email=user_in.email.lower(),
        password_hash=hashed_pwd,
        role=role,
        is_active=True
    )
    db.add(user)
    db.flush()  # Gets the user.id

    # Create approval request
    # If first user, they are approved automatically. Otherwise, they are PENDING.
    req_status = "APPROVED" if is_first_user else "PENDING"
    request = EmployeeRequest(
        user_id=user.id,
        status=req_status
    )
    db.add(request)
    db.commit()
    db.refresh(user)

    return user

@router.post("/login", response_model=TokenResponse)
def login(login_in: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_in.email.lower()).first()
    if not user or not verify_password(login_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated"
        )

    # Generate JWT tokens
    access_token = create_access_token(subject=user.id)
    refresh_token = create_refresh_token(subject=user.id)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": user
    }

@router.post("/refresh", response_model=TokenResponse)
def refresh_token(refresh_in: TokenRefreshRequest, db: Session = Depends(get_db)):
    try:
        payload = decode_token(refresh_in.refresh_token)
        user_id = payload.get("sub")
        token_type = payload.get("type")
        if user_id is None or token_type != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )

    new_access_token = create_access_token(subject=user.id)
    new_refresh_token = create_refresh_token(subject=user.id)

    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "user": user
    }

@router.post("/logout")
def logout():
    return {"message": "Successfully logged out"}

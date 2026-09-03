from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


# Create a new user
@router.post("/")
def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    user = User(
        name=user_data.name,
        profession=user_data.profession,
        language=user_data.language,
        latitude=user_data.latitude,
        longitude=user_data.longitude,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


# Get user by ID
@router.get("/{user_id}")
def get_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return user


# Update user profile
@router.patch("/{user_id}")
def update_user(
    user_id: int,
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # Update name
    if user_data.name is not None:
        user.name = user_data.name

    # Update profession
    if user_data.profession is not None:
        user.profession = user_data.profession

    # Update language
    if user_data.language is not None:
        user.language = user_data.language

    # Update location
    if user_data.latitude is not None:
        user.latitude = user_data.latitude

    if user_data.longitude is not None:
        user.longitude = user_data.longitude

    db.commit()
    db.refresh(user)

    return user
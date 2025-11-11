from fastapi import Depends, FastAPI, HTTPException, status,APIRouter
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlmodel import Session, select
from typing import Optional, Annotated
from datetime import datetime, timedelta


from backend.app import database, schemas
from backend.app import models
from backend.app.database import get_session
from backend.app.utils import security

router = APIRouter(

    prefix="/auth",
    tags=["auth"]

)

SessionDep = Annotated[Session, Depends(get_session)]

@router.post("/signup", response_model=schemas.UserPublic )
def signup(user: schemas.UserCreate,session : SessionDep):
    db_user = security.get_user(session, user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_pwd = security.hash_password(user.password)

    db_user = models.User(
        email=user.email,
        hashed_password=hashed_pwd,
    )

    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user

@router.post("/login", response_model=schemas.Token )
def login(session : SessionDep,form_data: Annotated[OAuth2PasswordRequestForm,Depends()]):
    user = security.get_user(session,email=form_data.username)
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        subject=user.email,
        extra={"role": user.role},
        expires_delta=access_token_expires)

    return schemas.Token(access_token=access_token, token_type="bearer")

@router.get("/me", response_model=schemas.UserPublic )
def get_me(current_user: Annotated[models.User, Depends(security.get_current_user)]):
    return current_user

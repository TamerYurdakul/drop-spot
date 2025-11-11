from datetime import datetime, timedelta , timezone
from typing import Annotated, Optional
import jwt
from jwt.exceptions import InvalidTokenError
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from argon2 import PasswordHasher
from sqlmodel import Session, select

from backend.app import models, schemas
from backend.app.database import get_session
from backend.app.models import User
from backend.app.schemas import Token,UserCreate

SECRET_KEY = "cok_gizli_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

ph = PasswordHasher()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def hash_password(password:str) -> str:
    return ph.hash(password)

def verify_password(plain_password, hashed_password) -> bool:
    try:
        ph.verify(hashed_password, plain_password)
        return True
    except:
        return False

def create_access_token(subject: str,extra: Optional[dict], expires_delta: timedelta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)):

    now = datetime.now(timezone.utc)
    expire = now + expires_delta

    payload = {"sub": subject, "exp": expire, "iat": now}

    if extra :
        payload.update(extra)

    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    return token

def get_user(session: Session, email:str) -> models.User:
    user_query = select(models.User).where(models.User.email == email)
    user = session.exec(user_query).first()
    return user

def get_current_user(session: Annotated[Session,Depends(get_session)] , token : Annotated[str,Depends(oauth2_scheme)]) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception

        token_data = schemas.TokenData(email=email)
    except InvalidTokenError:
        # 'jwt.decode' hata fırlattı (imza yanlış VEYA süresi dolmuş)
        raise credentials_exception

    user = get_user(session, email=token_data.email)
    if user is None:
        raise credentials_exception
    return user
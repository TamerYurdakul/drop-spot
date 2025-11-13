from sqlmodel import SQLModel, Field
from datetime import datetime

#User = id , email , password(hashed yada normal) ,role created_at
#Drop = id , name , description , image_url , total_stock, claim_start,claim_end, created_at
#Waitlist= user_id , drop_id , join_time, priority_score
#Claim = id, user_id , drop_id , claim_code , claimed_at

# USER dtoları
class UserBase(SQLModel):
    email : str = Field(index=True)


class UserCreate(UserBase):
    password: str

class UserPublic(UserBase):
    id:int
    role : str
    created_at: datetime

# Drop dtoları
class DropBase(SQLModel):
    name : str = Field(index=True)
    description : str | None = None
    image_url : str | None = None
    claim_window_start : datetime | None = None
    claim_window_end : datetime | None = None


class DropCreate(DropBase):
    total_stock : int
    is_active: bool = False
class DropPublic(DropBase):
    id: int
    total_stock : int
    created_at: datetime
    is_active: bool

# Waitlist dtoları

class WaitListBase(SQLModel):
    drop_id : int
    join_date: datetime
    priority_score : float


class WaitListPublic(SQLModel):
    user_id: int
    drop_id: int
    join_date: datetime
    priority_score: float
    is_active: bool

#Claim dto
class ClaimPublic(SQLModel):
    claim_code : str
    claimed_at: datetime
    drop_id : int
    user_id: int

class Token(SQLModel):
    access_token: str
    token_type: str

class TokenData(SQLModel):
    email: str | None = None
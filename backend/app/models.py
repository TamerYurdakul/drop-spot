from datetime import datetime, timezone

from sqlalchemy import Nullable
from sqlmodel import SQLModel, Table, Column, create_engine, Field, Relationship ,UniqueConstraint
from schemas import UserBase, DropBase


#User = id , email , password(hashed yada normal) ,role created_at
#Drop = id , name , description , image_url , total_stock, claim_start,claim_end, created_at
#Waitlist= user_id , drop_id , join_time, priority_score
#Claim = id, user_id , drop_id , claim_code , claimed_at

class User(UserBase, table=True):
    id : int| None = Field(default=None, primary_key=True)
    hashed_password : str = Field(nullable=False)
    role : str = Field(nullable=False,default='user')
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    waitlist_entries : list["WaitList"] = Relationship(back_populates="user",cascade_delete=True)
    claims : list["Claim"] = Relationship(back_populates="user")

class Drop(DropBase, table=True):
    id : int | None = Field(default=None, primary_key=True)
    total_stock : int = Field(nullable=False,default=1)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active : bool | None =Field(nullable=False,default=False)
    waitlist_entries : list["WaitList"] = Relationship(back_populates="drop",cascade_delete=True)
    claims : list["Claim"] = Relationship(back_populates="drop",cascade_delete=True)

class WaitList(SQLModel, table=True):
    user_id : int = Field(foreign_key="user.id", primary_key=True)
    drop_id : int = Field(foreign_key="drop.id", primary_key=True, ondelete="CASCADE")
    join_date : datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    priority_score : float = Field(nullable=False)
    is_active : bool = Field(default=True, nullable=False)

    user : User = Relationship(back_populates="waitlist_entries")
    drop : Drop = Relationship(back_populates="waitlist_entries")


class Claim(SQLModel, table=True):
    id : int|None = Field(default=None, primary_key=True)
    user_id : int = Field(foreign_key="user.id", nullable=False)
    drop_id : int = Field(foreign_key="drop.id", nullable=False, ondelete="CASCADE")
    claim_code: str = Field(unique=True)
    claimed_at : datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    user: User = Relationship(back_populates="claims")
    drop: Drop = Relationship(back_populates="claims")
    __table_args__ = (UniqueConstraint("user_id", "drop_id"),)
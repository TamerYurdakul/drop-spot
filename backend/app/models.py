from datetime import datetime
from sqlmodel import SQLModel, Table, Column, create_engine, Field, Relationship ,UniqueConstraint
from .schemas import UserBase , DropBase


#User = id , email , password(hashed yada normal) ,role created_at
#Drop = id , name , description , image_url , total_stock, claim_start,claim_end, created_at
#Waitlist= user_id , drop_id , join_time, priority_score
#Claim = id, user_id , drop_id , claim_code , claimed_at

class User(UserBase, table=True):
    id : int| None = Field(default=None, primary_key=True)
    hashed_password : str = Field(nullable=False)
    role : str = Field(nullable=False,default='admin')
    created_at: datetime = Field(default_factory=datetime.utcnow)

    waitlist_entries : list["WaitList"] = Relationship(back_populates="user")
    claims : list["Claim"] = Relationship(back_populates="user")

class Drop(DropBase, table=True):
    id : int | None = Field(default=None, primary_key=True)
    total_stock : int = Field(nullable=False,default=1)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    waitlist_entries : list["WaitList"] = Relationship(back_populates="drop")
    claims : list["Claim"] = Relationship(back_populates="drop")

class WaitList(SQLModel, table=True):
    user_id : int = Field(foreign_key="user.id", primary_key=True)
    drop_id : int = Field(foreign_key="drop.id", primary_key=True)
    join_date : datetime = Field(default_factory=datetime.utcnow)
    priority_score : float = Field(nullable=False)

    user : User = Relationship(back_populates="waitlist_entries")
    drop : Drop = Relationship(back_populates="waitlist_entries")


class Claim(SQLModel, table=True):
    id : int|None = Field(default=None, primary_key=True)
    user_id : int = Field(foreign_key="user.id", nullable=False)
    drop_id : int = Field(foreign_key="drop.id", nullable=False)
    claim_code: str = Field(unique=True)
    claimed_at : datetime = Field(default_factory=datetime.utcnow)

    user: User = Relationship(back_populates="claims")
    drop: Drop = Relationship(back_populates="claims")
    __table_args__ = (UniqueConstraint("user_id", "drop_id"),)
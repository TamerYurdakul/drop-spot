from sqlmodel import SQLModel, create_engine , Session
from contextlib import contextmanager, asynccontextmanager  # lifespan için
from fastapi import FastAPI

sqllite_name = "drop_spot.db"
sqllite_uri = "sqlite:///" + sqllite_name

connect_args = {"check_same_thread": False}

engine = create_engine(sqllite_uri, echo=True, connect_args=connect_args)


def create_db():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:

            yield session

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db()
    yield
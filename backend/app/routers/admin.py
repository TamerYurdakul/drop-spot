from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from sqlmodel import select, Session, select, delete
from typing import List, Annotated
from fastapi.responses import JSONResponse
from datetime import datetime, timezone

from backend.app import database, schemas
from backend.app import models
from backend.app.database import get_session
from backend.app.utils import security
from backend.app.schemas import WaitListBase

router = APIRouter(
    prefix="/admin",
    tags=["admin"]
)

SessionDep = Annotated[Session, Depends(get_session)]


@router.get("/drops", response_model=List[models.Drop])
async def list_drops(session: SessionDep,
                     current_user: models.User = Depends(security.get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="You are not allowed to perform this action.")
    db_drops = session.exec(select(models.Drop)).all()
    return db_drops

@router.post("/drops", response_model=models.Drop)
async def create_drop(drop: schemas.DropCreate,
                      session: SessionDep,
                      current_user: models.User = Depends(security.get_current_user)):

    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="You are not allowed to perform this action.")

    db_drop = models.Drop(
            name=drop.name,
            total_stock=drop.total_stock,
            description=drop.description,
            image_url=drop.image_url,
            claim_window_start=drop.claim_window_start,
            claim_window_end=drop.claim_window_end,
            is_active=drop.is_active,

    )
    session.add(db_drop)
    session.commit()
    session.refresh(db_drop)
    return db_drop

@router.put("/drops/{drop_id}", response_model=schemas.DropPublic)
async def update_drop(drop_id : int,
                      drop_update: schemas.DropCreate,
                      session: SessionDep,
                      current_user: models.User = Depends(security.get_current_user)):

    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="You are not allowed to perform this action.")

    db_drop = session.get(models.Drop, drop_id)
    if db_drop is None:
        raise HTTPException(status_code=404, detail="Drop not found.")

    if drop_update.name is not None:
        db_drop.name = drop_update.name

    if drop_update.description is not None:
        db_drop.description = drop_update.description

    if drop_update.image_url is not None:
        db_drop.image_url = drop_update.image_url

    if drop_update.total_stock is not None:
        db_drop.total_stock = drop_update.total_stock

    if drop_update.claim_window_start is not None:
        db_drop.claim_window_start = drop_update.claim_window_start

    if drop_update.claim_window_end is not None:
        db_drop.claim_window_end = drop_update.claim_window_end
    if drop_update.is_active is not None:
        db_drop.is_active = drop_update.is_active

    session.add(db_drop)
    session.commit()
    session.refresh(db_drop)
    return db_drop

@router.delete("/drops/{drop_id}")
async def delete_drop(drop_id: int,
                      session: SessionDep,

                      current_user: models.User = Depends(security.get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="You are not allowed to perform this action.")

    db_drop = session.get(models.Drop, drop_id)
    if db_drop is None:
        raise HTTPException(status_code=404, detail="Drop not found.")

    session.delete(db_drop)
    session.commit()
    return {"message": "Drop deleted successfully."}
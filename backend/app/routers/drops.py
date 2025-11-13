from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from sqlalchemy import func
from sqlmodel import select, Session, select, delete
from typing import List, Annotated
from fastapi.responses import JSONResponse
from datetime import datetime, timezone
from sqlalchemy.exc import IntegrityError
from backend.app import database, schemas
from backend.app import models
from backend.app.database import get_session
from backend.app.utils import security
from backend.app.schemas import WaitListBase, DropPublic, WaitListPublic
import uuid
from backend.app.utils.priority import calculate_priority

router = APIRouter(

    prefix="/drops",
    tags=["drops"]
)
SessionDep = Annotated[Session, Depends(get_session)]


@router.get("/", response_model=List[DropPublic])
async def get_drops( session : SessionDep ):
    db_drops = session.exec(select(models.Drop).where(models.Drop.is_active==True)).all()
    return db_drops

@router.post("/{drop_id}/join", response_model=WaitListPublic)
async def join_waitlist(
        drop_id: int,
        session: SessionDep,
        current_user: models.User = Depends(security.get_current_user)
):

    drop = session.get(models.Drop, drop_id)
    if drop is None:
        raise HTTPException(status_code=404, detail="Drop not found")
    if not drop.is_active:
        raise HTTPException(status_code=400, detail="Drop is not active")

    # Kullanıcının daha önce bu drop'a katılıp katılmadığını kontrol et
    existing_waitlist = session.get(models.WaitList, (current_user.id, drop_id))
    
    if existing_waitlist is not None:
        # Eğer kayıt varsa ve aktifse, mevcut kaydı döndür
        if existing_waitlist.is_active:
            return existing_waitlist
        
        # Eğer kayıt varsa ama deaktif ise (leave yapmış), reaktive et
        # Priority score değişmez, idempotency sağlanır
        existing_waitlist.is_active = True
        existing_waitlist.join_date = datetime.now(timezone.utc)
        session.add(existing_waitlist)
        session.commit()
        session.refresh(existing_waitlist)
        return existing_waitlist

    # İlk kez katılıyorsa, yeni kayıt oluştur
    now = datetime.now(timezone.utc)


    created_at = drop.created_at
    if created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=timezone.utc)

    latency = now - created_at
    sign_up_latency = max(int(latency.total_seconds() * 1000), 0)

    user_created_at = current_user.created_at
    if user_created_at.tzinfo is None:
        user_created_at = user_created_at.replace(tzinfo=timezone.utc)

    acount_age_days = max((now - user_created_at).days, 0)

    # Sadece aktif waitlist kayıtlarını say (soft delete için)
    rapid_actions = session.scalar(
        select(func.count(models.WaitList.drop_id)).where(
            models.WaitList.user_id == current_user.id,
            models.WaitList.is_active == True
        )
    )
    if rapid_actions is None:
        rapid_actions = 0

    priority_base = 100

    priority_score = calculate_priority(priority_base, sign_up_latency,acount_age_days,rapid_actions)

    new_waitlist_entry = models.WaitList(
        user_id=current_user.id,
        drop_id=drop_id,
        join_date = datetime.now(timezone.utc),
        priority_score = priority_score,
    )
    try:
        session.add(new_waitlist_entry)
        session.commit()
        session.refresh(new_waitlist_entry)
    except IntegrityError:
        session.rollback()

        existing = session.get(models.WaitList, (current_user.id, drop_id))
        if existing:
            return existing
        raise HTTPException(status_code=500, detail="Failed to join waitlist")

    return new_waitlist_entry

@router.post("/{drop_id}/leave")
async def leave_waitlist(
        drop_id: int,
        session: SessionDep,
        current_user: models.User = Depends(security.get_current_user)):

    drop = session.get(models.Drop, drop_id)
    if drop is None:
        raise HTTPException(status_code=404, detail="Drop not found")
    if not drop.is_active:
        raise HTTPException(status_code=400, detail="Drop is not active")

    waitlist_entry = session.get(models.WaitList, (current_user.id, drop_id))

    if waitlist_entry is None or not waitlist_entry.is_active:
        return {"message": "You were not on the waitlist"}

    # Kaydı silmek yerine deaktive et (soft delete)
    # Bu sayede priority score korunur ve idempotency sağlanır
    waitlist_entry.is_active = False
    session.add(waitlist_entry)
    session.commit()
    return {"message": "Left waitlist successfully"}

@router.post("/{drop_id}/claim")
async def claim_drop(
        drop_id: int,
        session: SessionDep,
        current_user: models.User = Depends(security.get_current_user)
):
    drop = session.get(models.Drop, drop_id)
    if drop is None:
        raise HTTPException(status_code=404, detail="Drop not found")
    if not drop.is_active:
        raise HTTPException(status_code=400, detail="Drop is not active")


    now = datetime.now(timezone.utc)
    if drop.claim_window_start is None or drop.claim_window_end is None:
        raise HTTPException(status_code=400, detail="Claim window not set")
    

    claim_start = drop.claim_window_start
    claim_end = drop.claim_window_end

    if claim_start.tzinfo is None:
        claim_start = claim_start.replace(tzinfo=timezone.utc)

    if claim_end.tzinfo is None:
        claim_end = claim_end.replace(tzinfo=timezone.utc)
    
    if not (claim_start <= now <= claim_end):
        raise HTTPException(status_code=403, detail="Claim window is not open")

    waitlist_entry = session.get(models.WaitList, (current_user.id, drop_id))
    if waitlist_entry is None or not waitlist_entry.is_active:
        raise HTTPException(status_code=403, detail="You are not on the active waitlist")

    existing = session.exec(select(models.Claim).where(
        models.Claim.user_id == current_user.id,
        models.Claim.drop_id == drop_id
    )).first()

    if existing is not None:
        return existing

    waitlist_entries = session.exec(
        select(models.WaitList)
        .where(models.WaitList.drop_id == drop_id, models.WaitList.is_active == True)
        .order_by(models.WaitList.priority_score.desc())
    ).all()

    user_position = None
    for idx, entry in enumerate(waitlist_entries):
        if entry.user_id == current_user.id:
            user_position = idx
            break

    if user_position is None:
        raise HTTPException(status_code=500, detail="Waitlist entry not found")


    claimed_count = len(session.exec(
        select(models.Claim).where(models.Claim.drop_id == drop_id)
    ).all())


    if user_position >= (drop.total_stock - claimed_count):
        raise HTTPException(
            status_code=403,
            detail=f"Your position in queue is {user_position + 1}, but only {drop.total_stock - claimed_count} claims remaining"
        )


    claim_code = f"DROP-{drop_id}-{current_user.id}-{uuid.uuid4().hex[:8].upper()}"

    # 7. Claim kaydı oluşturma
    new_claim = models.Claim(
        user_id=current_user.id,
        drop_id=drop_id,
        claim_code=claim_code,
        claimed_at=datetime.now(timezone.utc)
    )

    try:
        session.add(new_claim)
        session.commit()
        session.refresh(new_claim)
    except IntegrityError:
        session.rollback()
        existing_claim = session.exec(
            select(models.Claim).where(
                models.Claim.user_id == current_user.id,
                models.Claim.drop_id == drop_id
            )
        ).first()
        if existing_claim:
            return existing_claim
        raise HTTPException(status_code=500, detail="Failed to create claim")

    return new_claim

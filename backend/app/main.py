from fastapi import FastAPI
from contextlib import contextmanager

from backend.app.database import create_db, lifespan
from backend.app.routers import auth, admin, drops

app = FastAPI(lifespan=lifespan)

app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(drops.router)

@app.get("/")
async def root():
    return {"message": "Drop-Spot Api"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
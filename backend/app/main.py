from fastapi import FastAPI
from contextlib import contextmanager

from database import create_db, lifespan
from routers import auth, admin

app = FastAPI(lifespan=lifespan)

app.include_router(auth.router)
app.include_router(admin.router)

@app.get("/")
async def root():
    return {"message": "Drop-Spot Api"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import contextmanager

from backend.app.database import create_db, lifespan
from backend.app.routers import auth, admin, drops

app = FastAPI(lifespan=lifespan)

# CORS ayarları - Frontend'in backend'e erişmesi için gerekli
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Geliştirme için tüm origin'lere izin ver
    allow_credentials=True,
    allow_methods=["*"],  # Tüm HTTP metodlarına izin ver (GET, POST, PUT, DELETE)
    allow_headers=["*"],  # Tüm header'lara izin ver
)

app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(drops.router)

@app.get("/")
async def root():
    return {"message": "Drop-Spot Api"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
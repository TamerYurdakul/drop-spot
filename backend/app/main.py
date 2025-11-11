from fastapi import FastAPI


from .database import create_db , lifespan

app = FastAPI(lifespan=lifespan)


@app.get("/")
async def root():
    return {"message": "Drop-Spot Api"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
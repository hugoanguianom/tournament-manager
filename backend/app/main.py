from fastapi import FastAPI
from app.database import engine, Base
from app.models import player
from app.routers import players_router

Base.metadata.create_all(bind=engine)


app = FastAPI(title="TK3")
app.include_router(players_router.router)
@app.get("/")
def home():
    return {"server working on"}
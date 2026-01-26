from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.models import player
from app.models import tournament
from app.models import tournament_player 

from app.routers import players_router, tournaments_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="TK3")

app.add_middleware(
      CORSMiddleware,
      allow_origins=["http://localhost:4200"],  
      allow_credentials=True,                   
      allow_methods=["*"],                       
      allow_headers=["*"],                       
  )

app.include_router(players_router.router)
app.include_router(tournaments_router.router) 

@app.get("/")
def home():
    return {"server working on"}
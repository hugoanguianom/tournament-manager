from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.models import player
from app.models import tournament
from app.models import tournament_player
from app.models import match 
from app.routers import players_router, tournaments_router, reports_router


# create tables from imports
Base.metadata.create_all(bind=engine)

app = FastAPI(title="TK3")
# CORS configuration to allow requests from the frontend application
origins = [
    "http://localhost:4200",
]

app.add_middleware(
      CORSMiddleware,
      allow_origins=origins,  
      allow_credentials=True,                   
      allow_methods=["*"],                       
      allow_headers=["*"],                       
  )

# routers

app.include_router(players_router.router)
app.include_router(tournaments_router.router) 
app.include_router(reports_router.router)

# basic endpoint to check if the server is working 
@app.get("/")
def home():
    return {"server working on"}
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.models import player
from app.routers import players_router

Base.metadata.create_all(bind=engine)


app = FastAPI(title="TK3")
# allow angular to do request
app.add_middleware(
      CORSMiddleware,
      allow_origins=["http://localhost:4200"],  
      allow_credentials=True,                   
      allow_methods=["*"],                       
      allow_headers=["*"],                       
  )
app.include_router(players_router.router)
@app.get("/")
def home():
    return {"server working on"}
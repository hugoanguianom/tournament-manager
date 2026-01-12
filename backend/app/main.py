from fastapi import FastAPI
from app.database import engine, Base
from app.models import player

Base.metadata.create_all(bind=engine)

app = FastAPI(title="TK3")

@app.get("/")
def home():
    return {"server working on"}
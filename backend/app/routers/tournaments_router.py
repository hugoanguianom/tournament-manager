from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import tournament as models
from app.schemas import tournament_schemas as schemas

router = APIRouter(
    prefix="/tournaments",
    tags=["tournaments"]
)

# create a tournament
@router.post("/", response_model=schemas.TournamentResponse)
def create_tournament(tournament: schemas.TournamentCreate, db: Session = Depends(get_db)):
    db_tournament = models.Tournament(name=tournament.name)
    
    db.add(db_tournament)
    db.commit()
    db.refresh(db_tournament)
    
    return db_tournament

# get all tournaments
@router.get("/", response_model=List[schemas.TournamentResponse])
def read_tournaments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    tournaments = db.query(models.Tournament).offset(skip).limit(limit).all()
    return tournaments

# get tournaments by id
@router.get("/{tournament_id}", response_model=schemas.TournamentResponse)
def read_tournament(tournament_id: int, db: Session = Depends(get_db)):
    db_tournament = db.query(models.Tournament).filter(models.Tournament.id == tournament_id).first()
    if db_tournament is None:
        raise HTTPException(status_code=404, detail="Tournament not found")
    return db_tournament
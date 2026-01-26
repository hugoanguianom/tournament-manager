from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List

from app.database import get_db
from app.models import tournament as models
from app.models.player import Player
from app.schemas import tournament_schemas as schemas

router = APIRouter(
    prefix="/tournaments",
    tags=["tournaments"]
)

# create tournament
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

# get tournament by id
@router.get("/{tournament_id}", response_model=schemas.TournamentResponse)
def read_tournament(tournament_id: int, db: Session = Depends(get_db)):
    db_tournament = db.query(models.Tournament)\
        .options(joinedload(models.Tournament.participants))\
        .filter(models.Tournament.id == tournament_id).first()
    if db_tournament is None:
        raise HTTPException(status_code=404, detail="Tournament not found")
    return db_tournament

# generate tournament with participants
@router.post("/{tournament_id}/generate", response_model=schemas.TournamentResponse)
def generate_tournament(tournament_id: int, payload: schemas.TournamentGenerate, db: Session = Depends(get_db)):
    db_tournament = db.query(models.Tournament)\
        .filter(models.Tournament.id == tournament_id).first()
    if not db_tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")

    players = db.query(Player).filter(Player.id.in_(payload.player_ids)).all()

    db_tournament.status = models.TournamentStatus.GENERATED
    db_tournament.participants = players
    db.commit()
    db.refresh(db_tournament)

    return db_tournament
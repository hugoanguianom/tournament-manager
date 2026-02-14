from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
import random
import math

from app.database import get_db
from app.models import tournament as models
from app.models.player import Player
from app.models.match import Match, MatchStatus
from app.schemas import tournament_schemas as schemas
from app.schemas import match_schemas

router = APIRouter(
    prefix="/tournaments",
    tags=["tournaments"]
)


# Crear torneo
@router.post("/", response_model=schemas.TournamentResponse)
def create_tournament(tournament: schemas.TournamentCreate, db: Session = Depends(get_db)):
    db_tournament = models.Tournament(name=tournament.name)
    db.add(db_tournament)
    db.commit()
    db.refresh(db_tournament)
    return db_tournament


# Obtener todos los torneos
@router.get("/", response_model=List[schemas.TournamentResponse])
def read_tournaments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    tournaments = db.query(models.Tournament).offset(skip).limit(limit).all()
    return tournaments


# Obtener torneo por ID
@router.get("/{tournament_id}", response_model=schemas.TournamentResponse)
def read_tournament(tournament_id: int, db: Session = Depends(get_db)):
    db_tournament = db.query(models.Tournament)\
        .options(joinedload(models.Tournament.participants))\
        .filter(models.Tournament.id == tournament_id).first()
    if db_tournament is None:
        raise HTTPException(status_code=404, detail="Tournament not found")
    return db_tournament


# Generar torneo con bracket
@router.post("/{tournament_id}/generate", response_model=schemas.TournamentResponse)
def generate_tournament(tournament_id: int, payload: schemas.TournamentGenerate, db: Session = Depends(get_db)):
    db_tournament = db.query(models.Tournament)\
        .filter(models.Tournament.id == tournament_id).first()
    if not db_tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")

    if len(payload.player_ids) < 2:
        raise HTTPException(status_code=400, detail="Minimum 2 players required")

    # Obtener jugadores
    players = db.query(Player).filter(Player.id.in_(payload.player_ids)).all()

    # Guardar participantes
    db_tournament.participants = players

    # Barajar aleatoriamente
    random.shuffle(players)

    # Calcular siguiente potencia de 2
    n = len(players)
    bracket_size = 2 ** math.ceil(math.log2(n))

    # Rellenar con None (BYE) hasta la potencia de 2
    players_with_byes = players + [None] * (bracket_size - n)

    # Crear matches de primera ronda
    num_matches = bracket_size // 2
    for i in range(num_matches):
        p1 = players_with_byes[i * 2]
        p2 = players_with_byes[i * 2 + 1]

        match = Match(
            tournament_id=tournament_id,
            round=1,
            position=i + 1,
            player1_id=p1.id if p1 else None,
            player2_id=p2.id if p2 else None
        )

        # Si hay BYE, el otro jugador gana automáticamente
        if p1 is None and p2 is not None:
            match.winner_id = p2.id
            match.status = MatchStatus.RESOLVED
        elif p2 is None and p1 is not None:
            match.winner_id = p1.id
            match.status = MatchStatus.RESOLVED

        db.add(match)

    db_tournament.status = models.TournamentStatus.GENERATED
    db.commit()
    db.refresh(db_tournament)

    return db_tournament


# Obtener bracket del torneo
@router.get("/{tournament_id}/bracket", response_model=List[match_schemas.MatchResponse])
def get_bracket(tournament_id: int, db: Session = Depends(get_db)):
    matches = db.query(Match)\
        .options(joinedload(Match.player1), joinedload(Match.player2))\
        .filter(Match.tournament_id == tournament_id)\
        .order_by(Match.round, Match.position)\
        .all()
    return matches

# marcar ganador 
@router.post("/{tournament_id}/matches/{match_id}/winner", response_model=match_schemas.MatchResponse)
def set_match_winner(tournament_id: int, match_id: int, payload: match_schemas.SetWinner, db: Session =
Depends(get_db)):
    match = db.query(Match)\
        .filter(Match.id == match_id, Match.tournament_id == tournament_id)\
        .first()

    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    if match.status == MatchStatus.RESOLVED:
        raise HTTPException(status_code=400, detail="Match already resolved")

      # Validar que el winner_id sea player1 o player2
    if payload.winner_id not in [match.player1_id, match.player2_id]:
        raise HTTPException(status_code=400, detail="Winner must be player1 or player2")

    match.winner_id = payload.winner_id
    match.status = MatchStatus.RESOLVED
    db.commit()
    db.refresh(match)
    return match

 # Generar siguiente ronda
@router.post("/{tournament_id}/next-round", response_model=List[match_schemas.MatchResponse])
def generate_next_round(tournament_id: int, db: Session = Depends(get_db)):
    db_tournament = db.query(models.Tournament)\
        .filter(models.Tournament.id == tournament_id).first()

    if not db_tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")

      # Obtener la ronda actual (la mas alta)
    all_matches = db.query(Match)\
        .filter(Match.tournament_id == tournament_id)\
        .order_by(Match.round, Match.position)\
        .all()

    if not all_matches:
        raise HTTPException(status_code=400, detail="No matches found")

    current_round = 0
    for m in all_matches:
        if m.round > current_round:
            current_round = m.round

      # Obtener matches de la ronda actual
    current_matches = []
    for m in all_matches:
        if m.round == current_round:
            current_matches.append(m)

      # Comprobar que todos estan resueltos
    for m in current_matches:
        if m.status != MatchStatus.RESOLVED:
            raise HTTPException(status_code=400, detail="Still pending matches in current round")

      # Obtener ganadores en orden de posicion
    winners = []
    for m in current_matches:
        winners.append(m.winner_id)

      # Si solo queda 1 ganador -> torneo FINISHED
    if len(winners) == 1:
        db_tournament.status = models.TournamentStatus.FINISHED
        db_tournament.winner_id = winners[0]
        db.commit()
        raise HTTPException(status_code=400, detail="Tournament finished! Champion decided.")

      # Crear matches de la siguiente ronda
    next_round = current_round + 1
    new_matches = []
    for i in range(0, len(winners), 2):
        p1_id = winners[i]
        p2_id = winners[i + 1] if (i + 1) < len(winners) else None

        new_match = Match(
            tournament_id=tournament_id,
            round=next_round,
            position=(i // 2) + 1,
            player1_id=p1_id,
            player2_id=p2_id
          )

          # BYE en ronda siguiente (raro, pero por seguridad)
        if p2_id is None:
            new_match.winner_id = p1_id
            new_match.status = MatchStatus.RESOLVED

        db.add(new_match)
        new_matches.append(new_match)

    db.commit()
    for m in new_matches:
        db.refresh(m)

    return new_matches


import random
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import tournament as models
from app.models.player import Player
from app.models.match import Match, MatchStatus
from app.schemas import tournament_schemas as schemas
from app.schemas import match_schemas

router = APIRouter(prefix="/tournaments", tags=["tournaments"])

# ==========================================
# CREAR Y LISTAR TORNEOS
# ==========================================

@router.post("/", response_model=schemas.TournamentResponse)
def create_tournament(tournament: schemas.TournamentCreate, db: Session = Depends(get_db)):
    nuevo = models.Tournament(name=tournament.name)
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo

@router.get("/", response_model=List[schemas.TournamentResponse])
def read_tournaments(db: Session = Depends(get_db)):
    return db.query(models.Tournament).all()

@router.get("/{tournament_id}", response_model=schemas.TournamentResponse)
def read_tournament(tournament_id: int, db: Session = Depends(get_db)):
    tournament = db.query(models.Tournament).filter(models.Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(status_code=404, detail="Torneo no encontrado")
    return tournament

# ==========================================
# GENERAR BRACKET (primera ronda)
# ==========================================

@router.post("/{tournament_id}/generate")
def generate_tournament(tournament_id: int, payload: schemas.TournamentGenerate, db: Session = Depends(get_db)):
    tournament = db.query(models.Tournament).filter(models.Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(status_code=404, detail="Torneo no encontrado")

    if len(payload.player_ids) < 2:
        raise HTTPException(status_code=400, detail="Necesitas al menos 2 jugadores")

    # Guardar los participantes
    players = db.query(Player).filter(Player.id.in_(payload.player_ids)).all()
    tournament.participants = players

    # Mezclar jugadores
    player_ids = list(payload.player_ids)
    random.shuffle(player_ids)

    # Calcular potencia de 2
    bracket_size = 2
    while bracket_size < len(player_ids):
        bracket_size *= 2

    while len(player_ids) < bracket_size:
        player_ids.append(None)

    # Crear matches
    for i in range(0, len(player_ids), 2):
        p1 = player_ids[i]
        p2 = player_ids[i + 1]

        match = Match(
            tournament_id=tournament_id,
            round=1,
            position=(i // 2) + 1,
            player1_id=p1,
            player2_id=p2
        )

        if p2 is None and p1 is not None:
            match.winner_id = p1
            match.status = MatchStatus.RESOLVED
        elif p1 is None and p2 is not None:
            match.winner_id = p2
            match.status = MatchStatus.RESOLVED

        db.add(match)

    tournament.status = models.TournamentStatus.GENERATED
    db.commit()
    return {"message": "Torneo generado"}


# OBTENER BRACKET


@router.get("/{tournament_id}/bracket", response_model=List[match_schemas.MatchResponse])
def get_bracket(tournament_id: int, db: Session = Depends(get_db)):
    return db.query(Match)\
        .filter(Match.tournament_id == tournament_id)\
        .order_by(Match.round, Match.position)\
        .all()


# AVANZAR RONDA

@router.post("/{tournament_id}/next-round")
def next_round(tournament_id: int, payload: dict, db: Session = Depends(get_db)):
    tournament = db.query(models.Tournament).filter(models.Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(status_code=404, detail="Torneo no encontrado")

    # save players
    winners_data = payload.get("winners", {})
    for match_id_str, winner_id in winners_data.items():
        match_id = int(match_id_str)
        match = db.query(Match).filter(Match.id == match_id).first()
        if match and match.status == MatchStatus.PENDING:
            if winner_id in [match.player1_id, match.player2_id]:
                match.winner_id = winner_id
                match.status = MatchStatus.RESOLVED

    db.commit()

    # get current round
    current_round = db.query(func.max(Match.round)).filter(Match.tournament_id == tournament_id).scalar() or 0

    # get matches
    current_matches = db.query(Match).filter(
        Match.tournament_id == tournament_id, 
        Match.round == current_round
    ).order_by(Match.position).all()

    for m in current_matches:
        if m.status != MatchStatus.RESOLVED:
            raise HTTPException(status_code=400, detail=f"El combate {m.id} aún está pendiente")

    
    winners = [m.winner_id for m in current_matches]

    # finalizar si queda 1 
    if len(winners) == 1:
        tournament.status = models.TournamentStatus.FINISHED
        tournament.winner_id = winners[0]
        db.commit()
        return {"message": "Torneo finalizado", "winner_id": winners[0]}

    # 6. Crear siguiente ronda
    next_round_num = current_round + 1
    for i in range(0, len(winners), 2):
        p1 = winners[i]
        p2 = winners[i + 1] if (i + 1) < len(winners) else None

        new_match = Match(
            tournament_id=tournament_id,
            round=next_round_num,
            position=(i // 2) + 1,
            player1_id=p1,
            player2_id=p2
        )

        if p2 is None:
            new_match.winner_id = p1
            new_match.status = MatchStatus.RESOLVED

        db.add(new_match)

    db.commit()
    return {"message": "Siguiente ronda generada"}
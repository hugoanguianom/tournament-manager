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

router = APIRouter(prefix="/tournaments")


# crud
# create a new tournament
@router.post("/", response_model=schemas.TournamentResponse)
def create_tournament(tournament: schemas.TournamentCreate, db: Session = Depends(get_db)):
    new = models.Tournament(name=tournament.name)
    db.add(new)
    db.commit()
    db.refresh(new)
    return new

# get all tournaments
@router.get("/", response_model=List[schemas.TournamentResponse])
def read_tournaments(db: Session = Depends(get_db)):
    return db.query(models.Tournament).all()

# get specific tournament by id
@router.get("/{tournament_id}", response_model=schemas.TournamentResponse)
def read_tournament(tournament_id: int, db: Session = Depends(get_db)):
    tournament = db.query(models.Tournament).filter(models.Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(status_code=404, detail="tournament not found")
    return tournament



# generate tournament 
# get a tournament, get a list of players_id. 
# check if the tournament and player exist
# get the players with the player id and assign to the tournament
@router.post("/{tournament_id}/generate")
def generate_tournament(tournament_id: int, players_id: schemas.TournamentGenerate, db: Session = Depends(get_db)):
    tournament = db.query(models.Tournament).filter(models.Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(status_code=404, detail="tournament not found")

    if len(players_id.player_ids) < 2:
        raise HTTPException(status_code=400, detail="at least 2 players_id are required")

    players_id = db.query(Player).filter(Player.id.in_(players_id.player_ids)).all()
    tournament.participants = players_id

    random.shuffle(players_id.player_ids)


    # create brackets * 2 until the number of players is less than the bracket size
    bracket_size = 2
    while bracket_size < len(players_id.player_ids):
        bracket_size *= 2
        

    while len(players_id.player_ids) < bracket_size:
        players_id.player_ids.append(None)

    
    for i in range(0, len(players_id.player_ids), 2):
        p1 = players_id.player_ids[i]
        p2 = players_id.player_ids[i + 1]

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
    return {"tournamen generated"}


# get bracket from a sppecific tournament by id
# ordered by round and position
@router.get("/{tournament_id}/bracket", response_model=List[match_schemas.MatchResponse])
def get_bracket(tournament_id: int, db: Session = Depends(get_db)):
    return db.query(Match).filter(Match.tournament_id == tournament_id).order_by(Match.round, Match.position).all()


# next round
# get a tournament, get a list of winners from each round
# check if the tournament exist
# check if the matches exist and are pending
# each winner list has a match id and a winner id.
@router.post("/{tournament_id}/next-round")
def next_round(tournament_id: int, data: schemas.NextRoundData, db: Session = Depends(get_db)):
    tournament = db.query(models.Tournament).filter(models.Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(status_code=404, detail="tournament not found")
    round_winners = data.winners
    
    # get winners and update the matches
    for winner in round_winners:
        match = db.query(Match).filter(Match.id == winner.match_id).first()
        if match and match.status == MatchStatus.PENDING:
            if winner.winner_id in [match.player1_id, match.player2_id]:
                match.winner_id = winner.winner_id
                match.status = MatchStatus.RESOLVED
    db.commit()

    # get current round by counting the max round from the matches of the tournament
    all_matches = db.query(Match).filter(Match.tournament_id == tournament_id).all()
    current_round = 0
    for i in all_matches:
      if i.round > current_round:
          current_round = i.round

    # get the current matches from the toruanemtn
    current_matches = db.query(Match).filter(Match.tournament_id == tournament_id, Match.round == current_round).order_by(Match.position).all()

    # check if all matches are resolved
    for i in current_matches:
        if i.status != MatchStatus.RESOLVED:
            raise HTTPException(status_code=400, detail=f"matches not finished")
    
    winners = [i.winner_id for i in current_matches]

    # if there is only one winner, the tournament is finished
    if len(winners) == 1:
        tournament.status = models.TournamentStatus.FINISHED
        tournament.winner_id = winners[0]
        db.commit()
        return {"tournament finished"}


    
    next_round_num = current_round + 1
    # 
    for i in range(0, len(winners), 2):
        p1 = winners[i]

        if (i + 1) < len(winners):
          p2 = winners[i + 1]
        else:
          p2 = None

        new_match = Match(
            tournament_id=tournament_id,
            round=next_round_num,
            position=(i // 2) + 1,
            player1_id=p1,
            player2_id=p2
        )

        #bye
        if p2 is None:
            new_match.winner_id = p1
            new_match.status = MatchStatus.RESOLVED

        db.add(new_match)

    db.commit()
    return {"next round"}
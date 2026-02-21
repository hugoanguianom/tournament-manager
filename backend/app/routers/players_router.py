from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.player import Player
from app.schemas.player_schemas import PlayerCreate, PlayerUpdate, PlayerResponse

# base endpoint for player
router = APIRouter(prefix="/players")


# get all players with the model PlayerResponse
@router.get("/", response_model=list[PlayerResponse])
def get_all_players(db: Session = Depends(get_db)):
    players = db.query(Player).all()
    return players


# Create a new player
@router.post("/", response_model=PlayerResponse)
def create_player(player: PlayerCreate, db: Session = Depends(get_db)):
    new_player = Player(nick=player.nick)
    db.add(new_player)
    db.commit()
    db.refresh(new_player)
    return new_player


#Update a specific player by id
@router.put("/{player_id}", response_model=PlayerResponse)
def update_player(player_id: int, player: PlayerUpdate, db: Session = Depends(get_db)):
    db_player = db.query(Player).filter(Player.id == player_id).first()
    if not db_player:
        raise HTTPException(status_code=404, detail="Player not found")

    if player.nick is not None:
          db_player.nick = player.nick
    if player.active is not None:
        db_player.active = player.active

    db.commit()
    db.refresh(db_player)
    return db_player


# togle the status from specific player by id
@router.patch("/{player_id}/toggle", response_model=PlayerResponse)
def toggle_player_status(player_id: int, db: Session = Depends(get_db)):
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    player.active = not player.active
    db.commit()
    db.refresh(player)
    return player
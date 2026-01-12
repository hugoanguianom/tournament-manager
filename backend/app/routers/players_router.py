from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.player import Player

router = APIRouter(prefix="/players", tags=["Players"])

@router.get("/")
def get_all_players(db: Session = Depends(get_db)):
    players = db.query(Player).all()
    return players

@router.post("/")
def create_player(nick: str, logo_url: str, db: Session = Depends(get_db)):
   
    new_player = Player(
        nick=nick,
        logo_url=logo_url,
        active=True
    )
    db.add(new_player)
    db.commit()
    db.refresh(new_player) 
    
    return new_player


@router.patch("/{player_id}/toggle")
def toggle_player_status(player_id: int, db: Session = Depends(get_db)):

    player = db.query(Player).filter(Player.id == player_id).first()
    
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    player.active = not player.active
  
    db.commit()
    
    return player
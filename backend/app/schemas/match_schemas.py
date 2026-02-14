from pydantic import BaseModel
from typing import Optional
from enum import Enum
from .player_schemas import PlayerResponse


class MatchStatus(str, Enum):
    PENDING = "PENDING"
    RESOLVED = "RESOLVED"


class MatchResponse(BaseModel):
    id: int
    tournament_id: int
    round: int
    position: int
    player1: Optional[PlayerResponse] = None
    player2: Optional[PlayerResponse] = None
    winner_id: Optional[int] = None
    status: MatchStatus

    class Config:
        from_attributes = True


class SetWinner(BaseModel):
    winner_id: int

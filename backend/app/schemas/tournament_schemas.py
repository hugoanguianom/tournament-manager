from pydantic import BaseModel
from typing import List
from datetime import datetime
from enum import Enum
from .player_schemas import PlayerResponse

class TournamentStatus(str, Enum):
    DRAFT = "DRAFT"
    GENERATED = "GENERATED"
    FINISHED = "FINISHED"

class TournamentCreate(BaseModel):
    name: str

class TournamentResponse(BaseModel):
    id: int
    name: str
    status: TournamentStatus
    created_at: datetime
    participants: List[PlayerResponse] = []

    class Config:
        from_attributes = True

class TournamentGenerate(BaseModel):
    player_ids: List[int]
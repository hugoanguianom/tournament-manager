from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum

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

    class Config:
        from_attributes = True 
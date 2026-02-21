import enum
from sqlalchemy import Column, ForeignKey, Integer, String, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class TournamentStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    GENERATED = "GENERATED"
    FINISHED = "FINISHED"

class Tournament(Base):
    __tablename__ = "tournaments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    status = Column(Enum(TournamentStatus), default=TournamentStatus.DRAFT)
    created_at = Column(DateTime, default=datetime.utcnow)
    winner_id = Column(Integer, ForeignKey("players.id"), nullable=True)
    
    participants = relationship(
        "Player",
        secondary="tournament_players"
    )

    matches = relationship("Match")
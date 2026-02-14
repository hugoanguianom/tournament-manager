import enum
from sqlalchemy import Column, Integer, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.database import Base


class MatchStatus(str, enum.Enum):
    PENDING = "PENDING"
    RESOLVED = "RESOLVED"


class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    tournament_id = Column(Integer, ForeignKey("tournaments.id"), nullable=False)
    round = Column(Integer, nullable=False)          
    position = Column(Integer, nullable=False)       
    player1_id = Column(Integer, ForeignKey("players.id"), nullable=True) 
    player2_id = Column(Integer, ForeignKey("players.id"), nullable=True) 
    winner_id = Column(Integer, ForeignKey("players.id"), nullable=True)
    status = Column(Enum(MatchStatus), default=MatchStatus.PENDING)

    # Relaciones
    tournament = relationship("Tournament", back_populates="matches")
    player1 = relationship("Player", foreign_keys=[player1_id])
    player2 = relationship("Player", foreign_keys=[player2_id])
    winner = relationship("Player", foreign_keys=[winner_id])

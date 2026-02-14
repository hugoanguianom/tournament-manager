from sqlalchemy import Column, Integer, ForeignKey
from app.database import Base


class TournamentPlayer(Base):
    __tablename__ = "tournament_players"

    tournament_id = Column(Integer, ForeignKey("tournaments.id"), primary_key=True)
    player_id = Column(Integer, ForeignKey("players.id"), primary_key=True)
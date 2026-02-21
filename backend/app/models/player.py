from sqlalchemy import Column, Integer, String, Boolean
from app.database import Base

class Player(Base):
    __tablename__ = "players"
    id = Column(Integer, primary_key=True, index=True)
    nick = Column(String(100), nullable=False, unique=True)
    active = Column(Boolean, default=True)

   
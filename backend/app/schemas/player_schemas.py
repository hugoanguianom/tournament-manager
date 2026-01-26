# Data Transfer Object 
from pydantic import BaseModel
from typing import Optional


# POST to create a new Player
class PlayerCreate(BaseModel):
    nick:str
    
# PUT to edit a player
class PlayerUpdate(BaseModel):
    nick: Optional[str]=None
    active : Optional[bool] = None
   
# Get data from specific player from frontend (JSON)    
class PlayerResponse(BaseModel):
    id:int
    nick: str
    active: bool

    # Convert database player to JSON
    class Config:
        from_attributes= True
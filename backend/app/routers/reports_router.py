from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.player import Player
from app.models.match import Match, MatchStatus

# base endpoint for reports
router = APIRouter(prefix="/reports")

# players ranking
# Get all players
# Get all matches where status is resolved
# For each player count wins and losses

@router.get("/leaderboard")
def get_leaderboard(db: Session = Depends(get_db)):
    players = db.query(Player).all()
    matches = db.query(Match).filter(Match.status == MatchStatus.RESOLVED).all()
    leaderboard = []
    # for each player count wins and losses
    for player in players:
        wins = 0
        losses = 0
        # for each match check if the player participated and if he won or lost
        # first check if the player is the player1 or player2
        for match in matches:
            played = match.player1_id == player.id or match.player2_id == player.id

            if played:
                is_bye = match.player1_id is None or match.player2_id is None
                if is_bye:
                    continue

                if match.winner_id == player.id:
                    wins = wins + 1
                else:
                    losses = losses + 1

        leaderboard.append({
            "id": player.id,
            "nick": player.nick,
            "active": player.active,
            "wins": wins,
            "losses": losses
        })

    # order by victory
    # by bubble sort
    for i in range(len(leaderboard)):
        for j in range(i + 1, len(leaderboard)):
            if leaderboard[j]["wins"] > leaderboard[i]["wins"]:
                temp = leaderboard[i]
                leaderboard[i] = leaderboard[j]
                leaderboard[j] = temp

    return leaderboard
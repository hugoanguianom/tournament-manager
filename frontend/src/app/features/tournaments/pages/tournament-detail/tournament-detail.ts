import { Component, OnInit } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { ActivatedRoute, RouterModule, Router } from '@angular/router';
  import { TournamentsService } from '../../../../core/services/tournaments.service';
  import { PlayersService } from '../../../../core/services/player.service';
  import { Player } from '../../../models/player.model';

  @Component({
    selector: 'app-tournament-detail',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './tournament-detail.html',
    styleUrl: './tournament-detail.css'
  })
  export class TournamentDetailComponent implements OnInit {

    // current tournament get bracket get tournament id
    tournamentId: number | null = null;
    tournament: any = null;

    // draft: all players and selected players
    allPlayers: Player[] = [];
    selectedPlayerIds: number[] = [];

    // generate and finished: save rounds
    rounds: any[][] = []; // list of list. each position is a round with its matches
    isFinalRound: boolean = false; // when the last round has only one match we show the champion
    champion: any = null; // save the champion

    pendingWinners: { [matchId: number]: number } = {};

    constructor(
      // with activate route we can get the tournament id fron the url
      private route: ActivatedRoute,
      private tournamentsService: TournamentsService,
      private playersService: PlayersService,
      private router: Router
    ) {}

    ngOnInit(): void {
      this.tournamentId = Number(this.route.snapshot.paramMap.get('id'));
      this.loadTournament();
    }

    // Carga el torneo y decide que mostrar segun su estado
    loadTournament() {
      if (!this.tournamentId) return;
      // call backend to get tournament details
      this.tournamentsService.getTournament(this.tournamentId).subscribe({
        next: (data) => {
          // save the tournament
          this.tournament = data;
          // if draft: select all players to start a new tournament
          // else load the bracket to show the tournament progress
          if (data.status === 'DRAFT') {
            this.loadPlayers();
          } else {
            this.loadBracket();
          }
        }
      });
    }

    // get active players to select
    loadPlayers() {
      this.playersService.getAll().subscribe(players => {
        this.allPlayers = players.filter(p => p.active);
      });
    }

    loadBracket() {
      if (!this.tournamentId) return;
      // get the brackets from the tournament id and
      // group them by round : match1_round1, match2_round1...
      this.tournamentsService.getBracket(this.tournamentId).subscribe({
        next: (matches) => {
          this.rounds = [];
          this.champion = null;
          // find max round number
          let maxRound = 0;
          // for each match we find the max round
          for (let i = 0; i < matches.length; i++) {
            if (matches[i].round > maxRound) {
              maxRound = matches[i].round;
            }
          }
          // group matches by round and push them to round list
          for (let r = 1; r <= maxRound; r++) {
            const roundMatches = [];
            for (let i = 0; i < matches.length; i++) {
              if (matches[i].round === r) {
                roundMatches.push(matches[i]);
              }
            }
            this.rounds.push(roundMatches);
          }

          // find the champion
          // catch the last round
          // if only has one match -> its the fina round
          // if the final round is resolved we can show the champion
          if (this.rounds.length > 0) {
            const lastRound = this.rounds[this.rounds.length - 1];
            this.isFinalRound = lastRound.length === 1;

            if (this.isFinalRound && lastRound[0].status === 'RESOLVED') {
              const finalMatch = lastRound[0];
              if (finalMatch.winner_id === finalMatch.player1?.id) {
                this.champion = finalMatch.player1;
              } else {
                this.champion = finalMatch.player2;
              }
            }
          }
        }
      });
    }

    // Selecciona o deselecciona un jugador para el torneo (DRAFT)
    togglePlayer(id: number) {
      const index = this.selectedPlayerIds.indexOf(id);
      if (index > -1) {
        this.selectedPlayerIds.splice(index, 1);
      } else {
        this.selectedPlayerIds.push(id);
      }
    }

    isSelected(playerId: number): boolean {
      return this.selectedPlayerIds.includes(playerId);
    }

    // Genera el bracket con los jugadores seleccionados
    confirmParticipants() {
      if (!this.tournamentId || this.selectedPlayerIds.length < 2) {
        alert('need at least 2 players');
        return;
      }
      this.tournamentsService.generateTournament(this.tournamentId, { player_ids: this.selectedPlayerIds }).subscribe({
        next: () => this.router.navigate(['/tournaments']),
        error: () => alert('Error al generar el cuadro.')
      });
    }

    // Preselecciona un ganador en un match (solo visual, no se envia al backend)
    toggleWinner(match: any, winnerId: number) {
      if (this.pendingWinners[match.id] === winnerId) {
        delete this.pendingWinners[match.id];
      } else {
        this.pendingWinners[match.id] = winnerId;
      }
    }

    // Comprueba si todos los matches pendientes tienen ganador preseleccionado
    allPendingSelected(): boolean {
      if (this.rounds.length === 0) return false;

      const lastRound = this.rounds[this.rounds.length - 1];
      for (let i = 0; i < lastRound.length; i++) {
        if (lastRound[i].status === 'PENDING' && !this.pendingWinners[lastRound[i].id]) {
          return false;
        }
      }
      return true;
    }

    // Envia los ganadores al backend y avanza a la siguiente ronda
   nextRound() {
      if (!this.tournamentId) return;

      let winnersList = [];
      for (let matchId in this.pendingWinners) {
          winnersList.push({
              match_id: Number(matchId),
              winner_id: this.pendingWinners[matchId]
          });
      }

      this.tournamentsService.generateNextRound(this.tournamentId,
  winnersList).subscribe({
          next: () => {
              this.pendingWinners = {};
              this.loadTournament();
          },
          error: () => alert('Error al avanzar ronda')
      });
  }

    getAvatarUrl(nick: string): string {
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(nick)}`;
    }
  }

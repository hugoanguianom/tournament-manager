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

    tournamentId: number | null = null;
    tournament: any = null;

    // DRAFT: jugadores disponibles y seleccionados
    allPlayers: Player[] = [];
    selectedPlayerIds: number[] = [];

    // GENERATED/FINISHED: bracket
    rounds: any[][] = [];
    isFinalRound: boolean = false;
    champion: any = null;

    // Ganadores preseleccionados (clave = id del match, valor = id del ganador)
    pendingWinners: { [matchId: number]: number } = {};

    constructor(
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

      this.tournamentsService.getTournament(this.tournamentId).subscribe({
        next: (data) => {
          this.tournament = data;
          if (data.status === 'DRAFT') {
            this.loadPlayers();
          } else {
            this.loadBracket();
          }
        }
      });
    }

    // Carga los jugadores activos (solo para DRAFT)
    loadPlayers() {
      this.playersService.getAll().subscribe(players => {
        this.allPlayers = players.filter(p => p.active);
      });
    }

    // Carga los matches del bracket y los agrupa por ronda
    loadBracket() {
      if (!this.tournamentId) return;

      this.tournamentsService.getBracket(this.tournamentId).subscribe({
        next: (matches) => {
          this.rounds = [];
          this.champion = null;

          // Encontrar cuantas rondas hay
          let maxRound = 0;
          for (let i = 0; i < matches.length; i++) {
            if (matches[i].round > maxRound) {
              maxRound = matches[i].round;
            }
          }

          // Agrupar matches por ronda
          for (let r = 1; r <= maxRound; r++) {
            const roundMatches = [];
            for (let i = 0; i < matches.length; i++) {
              if (matches[i].round === r) {
                roundMatches.push(matches[i]);
              }
            }
            this.rounds.push(roundMatches);
          }

          // Detectar si es la ronda final (solo 1 match)
          if (this.rounds.length > 0) {
            const lastRound = this.rounds[this.rounds.length - 1];
            this.isFinalRound = lastRound.length === 1;

            // Si la final ya esta resuelta, hay campeon
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
        alert('Necesitas al menos 2 jugadores.');
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

      this.tournamentsService.generateNextRound(this.tournamentId, this.pendingWinners).subscribe({
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

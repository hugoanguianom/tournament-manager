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
  allPlayers: Player[] = [];           // Jugadores activos disponibles (para DRAFT)
  tournamentParticipants: Player[] = []; // Participantes del torneo (para GENERATED)
  selectedPlayerIds: number[] = [];
  matches: any[] = [];
  rounds: any[][] = [];

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

  loadTournament() {
    if (this.tournamentId) {
      this.tournamentsService.getTournament(this.tournamentId).subscribe({
        next: (data) => {
          console.log('DATOS DEL TORNEO:', data);
          this.tournament = data;

          if (this.tournament.status === 'GENERATED') {
            // Torneo ya generado: mostrar participantes del backend
            this.tournamentParticipants = data.participants || [];
            this.selectedPlayerIds = this.tournamentParticipants.map((p: Player) => p.id);
             this.loadBracket();
          } else {
            // Torneo en DRAFT: cargar jugadores activos para seleccionar
            this.loadPlayers();
          }
        },
        error: (err) => {
          console.error('ERROR AL CARGAR:', err);
        }
      });
    }
  }

  loadPlayers() {
    this.playersService.getAll().subscribe(players => {
      this.allPlayers = players.filter(p => p.active);
    });
  }

groupMatchesByRound() {
    this.rounds = [];


    let maxRound = 0;
    for (let i = 0; i < this.matches.length; i++) {
      if (this.matches[i].round > maxRound) {
        maxRound = this.matches[i].round;
      }
    }


    for (let r = 1; r <= maxRound; r++) {
      const roundMatches = [];
      for (let i = 0; i < this.matches.length; i++) {
        if (this.matches[i].round === r) {
          roundMatches.push(this.matches[i]);
        }
      }
      this.rounds.push(roundMatches);
    }
  }
  loadBracket() {
    if (this.tournamentId) {
      this.tournamentsService.getBracket(this.tournamentId).subscribe({
        next: (matches) => {
          this.matches = matches;
          this.groupMatchesByRound();
        },
        error: (err) => {
          console.error('Error al cargar bracket:', err);
        }
      });
    }
  }

  togglePlayer(id: number) {
    if (this.tournament?.status === 'GENERATED') return;

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

  confirmParticipants() {
    if (this.tournamentId && this.selectedPlayerIds.length >= 2) {
      const payload = { player_ids: this.selectedPlayerIds };

      this.tournamentsService.generateTournament(this.tournamentId, payload).subscribe({
        next: (updatedTournament) => {
          console.log('Torneo generado con éxito:', updatedTournament);
          this.router.navigate(['/tournaments']);
        },
        error: (err) => {
          console.error('Error detallado:', err);
          alert('Error al generar el cuadro. Revisa la consola para más detalles.');
        }
      });
    } else {
      alert('Necesitas al menos 2 jugadores para generar el torneo.');
    }
  }

  getAvatarUrl(nick: string): string {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(nick)}`;
  }
}

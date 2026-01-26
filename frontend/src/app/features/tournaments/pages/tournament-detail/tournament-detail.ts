import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
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
  allPlayers: Player[] = [];
  selectedPlayerIds: number[] = [];

  constructor(
    private route: ActivatedRoute,
    private tournamentsService: TournamentsService,
    private playersService: PlayersService
  ) {}

  ngOnInit(): void {
    this.tournamentId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadPlayers();
  }

  loadPlayers() {
    this.playersService.getAll().subscribe(players => {
      // Solo mostramos los que estén activos para jugar
      this.allPlayers = players.filter(p => p.active);
    });
  }

  togglePlayer(id: number) {
    const index = this.selectedPlayerIds.indexOf(id);
    if (index > -1) {
      this.selectedPlayerIds.splice(index, 1);
    } else {
      this.selectedPlayerIds.push(id);
    }
  }

  confirmParticipants() {
    console.log('Registrando jugadores para el torneo:', this.selectedPlayerIds);
    // Próximo paso: Llamar al servicio para guardar y generar el cuadro
  }
}

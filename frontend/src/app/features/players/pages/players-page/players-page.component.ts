import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayersService } from '../../../../core/services/player.service';
import { Player } from '../../../models/player.model';

@Component({
  selector: 'app-players-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './players-page.component.html',
  styleUrl: './players-page.component.css'
})
export class PlayersPageComponent implements OnInit {

  // player list
  players: Player[] = [];
  // service inyected
  constructor(private playersService: PlayersService) { }

  ngOnInit(): void {
    this.loadPlayers();
  }
  // load players from backend
  loadPlayers(): void {
    this.playersService.getAll().subscribe({
      next: (data) => {
        this.players = data;
        console.log('Players loaded:', this.players);
      },
      error: (err) => {
        console.error('Error loading players:', err);
      }
    });
  }

  // active players
  get activePlayers(): Player[] {
    return this.players.filter(p => p.active);
  }

  // inactive player
  get inactivePlayers(): Player[] {
    return this.players.filter(p => !p.active);
  }

  // toggle active to inactive
  togglePlayer(player: Player): void {
    this.playersService.toggleActive(player.id).subscribe({
      next: (updatedPlayer) => {
        const index = this.players.findIndex(p => p.id === updatedPlayer.id);
        if (index !== -1) {
          this.players[index] = updatedPlayer;
        }
      },
      error: (err) => {
        console.error('Error toggling player:', err);
      }
    });
  }
}

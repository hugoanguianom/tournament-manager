import { Component, OnInit } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { PlayersService } from '../../../../core/services/player.service';
  import { Player } from '../../../models/player.model';
  import { PlayerFormComponent } from '../../components/player-form/player-form.component';

  @Component({
    selector: 'app-players-page',
    standalone: true,
    imports: [CommonModule, PlayerFormComponent],
    templateUrl: './players-page.component.html',
    styleUrl: './players-page.component.css'
  })
  export class PlayersPageComponent implements OnInit {

    players: Player[] = [];
    showForm: boolean = false;
    playerToEdit: Player | null = null;

  
    defaultAvatar: string = 'https://ui-avatars.com/api/?name=?&background=random';

    constructor(private playersService: PlayersService) {}

    ngOnInit(): void {
      this.loadPlayers();
    }

    loadPlayers(): void {
      this.playersService.getAll().subscribe({
        next: (data) => {
          this.players = data;
        },
        error: (err) => {
          console.error('Error loading players:', err);
        }
      });
    }

    get activePlayers(): Player[] {
      return this.players.filter(p => p.active);
    }

    get inactivePlayers(): Player[] {
      return this.players.filter(p => !p.active);
    }


    getAvatarUrl(nick: string): string {
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(nick)}`;
    }


    onImageError(event: Event): void {
      const img = event.target as HTMLImageElement;
      img.src = this.defaultAvatar;
    }

    openCreateForm(): void {
      this.playerToEdit = null;
      this.showForm = true;
    }

    openEditForm(player: Player): void {
      this.playerToEdit = player;
      this.showForm = true;
    }

    closeForm(): void {
      this.showForm = false;
      this.playerToEdit = null;
    }

    savePlayer(playerData: { nick: string, id?: number }): void {
      if (playerData.id) {
        this.playersService.update(playerData.id, { nick: playerData.nick }).subscribe({
          next: () => {
            this.loadPlayers();
            this.closeForm();
          },
          error: (err) => {
            console.error('Error updating player:', err);
          }
        });
      } else {
        this.playersService.create({ nick: playerData.nick }).subscribe({
          next: () => {
            this.loadPlayers();
            this.closeForm();
          },
          error: (err) => {
            console.error('Error creating player:', err);
          }
        });
      }
    }

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

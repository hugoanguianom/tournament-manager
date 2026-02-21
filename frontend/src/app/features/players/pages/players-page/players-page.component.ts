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
    // all players
    players: Player[] = [];
    // show form when creating or editing a player
    showForm: boolean = false;
    // if we will edit a player we will recibe the player
    // if not we will receive null
    playerToEdit: Player | null = null;
    defaultAvatar: string = 'https://ui-avatars.com/api/?name=?&background=random';

    constructor(private playersService: PlayersService) {}

    ngOnInit(): void {
      this.loadPlayers();
    }

    // load all players from the server
    // --> services getAll --> backend get_all_players with dbquery --> get data from database
    // --> backend get json data --> service receive data --> component receive data
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
      return 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + nick;
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
      // if player has id, we update
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
        // if player has no id, we create
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

    // toggle active or inactive status of a player
    // set active or inactive and load all players
    togglePlayer(player: Player): void {
      this.playersService.toggleActive(player.id).subscribe(() => {
          this.loadPlayers();
      });
  }

  }

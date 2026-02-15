import { Component, OnInit } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { RouterModule } from '@angular/router';
  import { ReportsService } from '../../../../core/services/reports.service';
  import { TournamentsService } from '../../../../core/services/tournaments.service';

  @Component({
    selector: 'app-reports-page',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './reports-page.html',
    styleUrl: './reports-page.css'
  })
  export class ReportsPageComponent implements OnInit {

    leaderboard: any[] = [];
    tournaments: any[] = [];
    selectedTournamentId: number | null = null;
    matches: any[] = [];

    constructor(
      private reportsService: ReportsService,
      private tournamentsService: TournamentsService
    ) {}

    ngOnInit(): void {
      this.loadLeaderboard();
      this.loadTournaments();
    }

    loadLeaderboard() {
      this.reportsService.getLeaderboard().subscribe({
        next: (data) => this.leaderboard = data
      });
    }

    loadTournaments() {
      this.tournamentsService.getTournaments().subscribe({
        next: (data) => this.tournaments = data
      });
    }

    selectTournament(id: number) {
      this.selectedTournamentId = id;
      this.tournamentsService.getBracket(id).subscribe({
        next: (data) => this.matches = data
      });
    }

    getAvatarUrl(nick: string): string {
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(nick)}`;
    }

    getWinnerNick(match: any): string {
      if (!match.winner_id) return '-';
      if (match.winner_id === match.player1?.id) return match.player1.nick;
      if (match.winner_id === match.player2?.id) return match.player2.nick;
      return '-';
    }
  }

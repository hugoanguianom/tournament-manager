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

    // ranking list of players
    leaderboard: any[] = [];
    // tournament list
    tournaments: any[] = [];
    // selected tournament to show the history
    selectedTournamentId: number | null = null;
    // matches of the selected tournament
    matches: any[] = [];

    constructor(
      private reportsService: ReportsService,
      private tournamentsService: TournamentsService
    ) {}

    ngOnInit(): void {
      this.loadLeaderboard();
      this.loadTournaments();
    }

    // get the leaderboard data from the server and store it in the leaderboard
    loadLeaderboard() {
      this.reportsService.getLeaderboard().subscribe({
        next: (data) => this.leaderboard = data
      });
    }

    // get the tournaments data from the server and store it in the tournaments
    loadTournaments() {
      this.tournamentsService.getTournaments().subscribe({
        next: (data) => this.tournaments = data
      });
    }

    // when we select a tournament we get the bracket data from the server and store it in the matches
    selectTournament(id: number) {
      this.selectedTournamentId = id;
      this.tournamentsService.getBracket(id).subscribe({
        next: (data) => this.matches = data
      });
    }

    getAvatarUrl(nick: string): string {
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(nick)}`;
    }

    // get the winner nick of a match
    // if there is no winner we return '-'
    getWinnerNick(match: any): string {
      if (!match.winner_id) return '-';
      if (match.winner_id === match.player1?.id) return match.player1.nick;
      if (match.winner_id === match.player2?.id) return match.player2.nick;
      return '-';
    }
  }

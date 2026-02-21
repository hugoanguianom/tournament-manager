import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TournamentsService } from '../../../../core/services/tournaments.service';
import { Tournament } from '../../../models/tournament.model';
import { Router } from '@angular/router';
import { TournamentFormComponent } from '../../components/tournament-form/tournament-form';

@Component({
  selector: 'app-tournaments-page',
  standalone: true,
  imports: [CommonModule, TournamentFormComponent],
  templateUrl: './tournaments-page.html',
  styleUrl: './tournaments-page.css'
})
export class TournamentsPageComponent implements OnInit {
  tournaments: Tournament[] = [];
  showForm: boolean = false;

  constructor(private tournamentsService: TournamentsService,
    private router: Router
  ) {}

  ngOnInit(): void { this.loadTournaments(); }

  loadTournaments() {
    this.tournamentsService.getTournaments().subscribe(data => this.tournaments = data);
  }

  openCreateForm() {
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
  }


  save(data: { name: string }) {
    this.tournamentsService.createTournament(data).subscribe(() => {
      this.loadTournaments();
      this.closeForm();
    });
  }


  // navigate to tournament details page
  goToDetails(id: number) {
  this.router.navigate(['/tournaments', id]);
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TournamentsService } from '../../../../core/services/tournaments.service';
import { Tournament } from '../../../models/tournament.model';
import { TournamentFormComponent } from '../../components/tournament-form/tournament-form';

@Component({
  selector: 'app-tournaments-page',
  standalone: true,
  // Añade TournamentFormComponent aquí
  imports: [CommonModule, TournamentFormComponent],
  templateUrl: './tournaments-page.html',
  styleUrl: './tournaments-page.css'
})
export class TournamentsPageComponent implements OnInit {
  tournaments: Tournament[] = [];
  showForm: boolean = false;

  constructor(private tournamentsService: TournamentsService) {}

  ngOnInit(): void { this.loadTournaments(); }

  loadTournaments() {
    this.tournamentsService.getAll().subscribe(data => this.tournaments = data);
  }


  openCreateForm() {
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
  }

  handleSave(data: { name: string }) {
    this.tournamentsService.create(data).subscribe(() => {
      this.loadTournaments();
      this.closeForm();
    });
  }

  goToDetails(id: number) {
    // Aquí navegarás a /tournaments/1 por ejemplo
    console.log('Navegando al torneo', id);
  }
}

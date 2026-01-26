import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necesario para *ngFor
import { TournamentsService } from '../../../../core/services/tournaments.service';
import { Tournament } from '../../../models/tournament.model';

@Component({
  selector: 'app-tournaments-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tournaments-page.html',
  styleUrl: './tournaments-page.css'
})
export class TournamentsPageComponent implements OnInit {
  tournaments: Tournament[] = [];

  constructor(private tournamentsService: TournamentsService) {}

  ngOnInit(): void {
    this.tournamentsService.getAll().subscribe({
      next: (data) => {
        this.tournaments = data;
      },
      error: (error) => console.error('Error:', error)
    });
  }
}

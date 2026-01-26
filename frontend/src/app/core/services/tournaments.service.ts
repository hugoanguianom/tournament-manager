import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tournament, TournamentCreate } from '../../features/models/tournament.model';

@Injectable({
  providedIn: 'root'
})
export class TournamentsService {

  private apiUrl = 'http://localhost:8000/tournaments';

  constructor(private http: HttpClient) { }

  getAll(): Observable<Tournament[]> {
    return this.http.get<Tournament[]>(this.apiUrl);
  }

  create(tournament: TournamentCreate): Observable<Tournament> {
    return this.http.post<Tournament>(this.apiUrl, tournament);
  }
}

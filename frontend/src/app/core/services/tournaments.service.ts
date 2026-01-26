import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TournamentsService {
  
  private apiUrl = 'http://localhost:8000/tournaments';

  constructor(private http: HttpClient) { }


  getTournaments(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }


  getTournament(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }


  createTournament(tournament: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, tournament);
  }


  generateTournament(id: number, payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/generate`, payload);
  }
}

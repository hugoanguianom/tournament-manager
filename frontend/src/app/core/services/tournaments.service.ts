import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TournamentsService {

  private apiUrl = 'http://localhost:8000/tournaments';

  constructor(private http: HttpClient) { }


  getTournaments() {
    return this.http.get<any[]>(this.apiUrl);
  }


  getTournament(id: number) {
      return this.http.get<any>(this.apiUrl + '/' + id);
  }


  createTournament(tournament: any) {
    return this.http.post<any>(this.apiUrl, tournament);
  }


  generateTournament(id: number, data: any) {
      return this.http.post<any>(this.apiUrl + '/' + id + '/generate', data);
  }
 getBracket(tournamentId: number) {
      return this.http.get<any[]>(this.apiUrl + '/' + tournamentId + '/bracket');
  }

   generateNextRound(tournamentId: number, winners: any[]) {
      return this.http.post<any>(this.apiUrl + '/' + tournamentId + '/next-round', { winners: winners });
  }

}

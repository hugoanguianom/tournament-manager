import { Injectable } from '@angular/core';
  import { HttpClient } from '@angular/common/http';
  import { Observable } from 'rxjs';

  @Injectable({
    providedIn: 'root'
  })
  export class ReportsService {

    private apiUrl = 'http://localhost:8000/reports';

    constructor(private http: HttpClient) {}

    getLeaderboard(): Observable<any[]> {
      return this.http.get<any[]>(`${this.apiUrl}/leaderboard`);
    }
  }

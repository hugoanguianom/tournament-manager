import { Injectable } from '@angular/core';
  import { HttpClient } from '@angular/common/http';

  @Injectable({
    providedIn: 'root'
  })
  export class ReportsService {

    private apiUrl = 'http://localhost:8000/reports/leaderboard';
    constructor(private http: HttpClient) {}

    getLeaderboard(){
      return this.http.get<any[]>(this.apiUrl);
    }
  }

// Injectable class
import { Injectable } from '@angular/core';
// HTTP petitions
import { HttpClient } from '@angular/common/http';
// Player model
import { Player } from '../../features/models/player.model'

// @Injectable (service)
// available in all app
@Injectable({
  providedIn: 'root'
})
export class PlayersService {

  // api url
  private apiUrl = 'http://localhost:8000/players';
  constructor(private http: HttpClient) { }

  // GET all players
  getAll() {
    return this.http.get<Player[]>(this.apiUrl);
  }


  // POST /players to create a new player
  // Solo enviamos nick
    create(player: { nick: string }) {
      return this.http.post<Player>(this.apiUrl, player);
    }


  // PUT /players/{id} to edit a player
  // all attributes optional

    update(id: number, player: { nick?: string, active?: boolean }) {
      return this.http.put<Player>(`${this.apiUrl}/${id}`, player);
    }

  // PATCH /players/{id}/toggle status of a player
  toggleActive(id: number){
    return this.http.patch<Player>(`${this.apiUrl}/${id}/toggle`, {});
  }
}

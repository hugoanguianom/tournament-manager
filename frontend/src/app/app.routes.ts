import { Routes } from '@angular/router';
import { PlayersPageComponent } from './features/players/pages/players-page/players-page.component';
// Importamos tu nueva página
import { TournamentsPageComponent } from './features/tournaments/pages/tournaments-page/tournaments-page';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'players',
    pathMatch: 'full'
  },
  {
    path: 'players',
    component: PlayersPageComponent
  },
  {
    path: 'tournaments',
    component: TournamentsPageComponent
  }
];

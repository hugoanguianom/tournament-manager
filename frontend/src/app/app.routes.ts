import { Routes } from '@angular/router';
import { PlayersPageComponent } from './features/players/pages/players-page/players-page.component';
// Importamos tu nueva página
import { TournamentsPageComponent } from './features/tournaments/pages/tournaments-page/tournaments-page';
import { TournamentDetailComponent } from './features/tournaments/pages/tournament-detail/tournament-detail';
import { ReportsPageComponent } from './features/reports/pages/reports-page/reports-page';

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
  },
  { path: 'tournaments/:id', component: TournamentDetailComponent },
  {path: 'reports',component:ReportsPageComponent}

];

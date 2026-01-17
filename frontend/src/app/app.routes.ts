import { Routes } from '@angular/router';
import { PlayersPageComponent } from './features/players/pages/players-page/players-page.component';

export const routes: Routes = [
  // /players
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
      component: PlayersPageComponent
    }
];

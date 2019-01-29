import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GameLobbyComponent } from './components/game-lobby/game-lobby.component';
import { GameLobbyResolver } from './resolvers/game-lobby.resolver';
import { LobbiesListComponent } from './components/lobbies-list/lobbies-list.component';

const routes: Routes = [
  {
    path: '',
    component: LobbiesListComponent,
  },
  {
    path: 'lobby',
    component: GameLobbyComponent,
    resolve: { data: GameLobbyResolver }
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [GameLobbyResolver]
})
export class AppRoutingModule {}

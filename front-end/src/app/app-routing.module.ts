import { LobbiesListResolver } from './resolvers/lobbies-list.resolver';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GameLobbyComponent } from './components/game-lobby/game-lobby.component';
import { GameLobbyResolver } from './resolvers/game-lobby.resolver';
import { LobbiesListComponent } from './components/lobbies-list/lobbies-list.component';

const routes: Routes = [
  {
    path: '',
    component: LobbiesListComponent,
    resolve: { data: LobbiesListResolver },
  },
  {
    path: 'lobbies/:id',
    component: GameLobbyComponent,
    resolve: { data: GameLobbyResolver }
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [GameLobbyResolver, LobbiesListResolver]
})
export class AppRoutingModule {}

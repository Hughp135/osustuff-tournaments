import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GameLobbyComponent } from './components/game-lobby/game-lobby.component';
import { GameLobbyResolver } from './resolvers/game-lobby.resolver';

const routes: Routes = [
  {
    path: '',
    component: GameLobbyComponent,
    resolve: { GameLobbyResolver }
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [GameLobbyResolver]
})
export class AppRoutingModule {}

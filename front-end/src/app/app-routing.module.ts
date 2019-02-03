import { UserProfileResolver } from './resolvers/user-profile.resolver';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { HomeComponent } from './components/home/home.component';
import { LeaderboardResolver } from './resolvers/leaderboard.resolver';
import { LobbiesListResolver } from './resolvers/lobbies-list.resolver';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GameLobbyComponent } from './components/game-lobby/game-lobby.component';
import { GameLobbyResolver } from './resolvers/game-lobby.resolver';
import { LobbiesListComponent } from './components/lobbies-list/lobbies-list.component';
import { LeaderboardComponent } from './components/leaderboard/leaderboard.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'lobbies',
    component: LobbiesListComponent,
    resolve: { data: LobbiesListResolver },
  },
  {
    path: 'lobbies/:id',
    component: GameLobbyComponent,
    resolve: { data: GameLobbyResolver },
  },
  {
    path: 'leaderboard',
    component: LeaderboardComponent,
    resolve: { data: LeaderboardResolver },
  },
  {
    path: 'user/:username',
    component: UserProfileComponent,
    resolve: { data: UserProfileResolver },
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [GameLobbyResolver, LobbiesListResolver, LeaderboardResolver, UserProfileResolver],
})
export class AppRoutingModule {}

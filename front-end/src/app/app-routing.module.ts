import { UserProfileResolver } from './resolvers/user-profile.resolver';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { HomeComponent } from './components/home/home.component';
import { LeaderboardResolver } from './resolvers/leaderboard.resolver';
import { LobbiesResolver } from './resolvers/lobbies-list.resolver';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GameLobbyComponent } from './components/game-lobby/game-lobby.component';
import { GameLobbyResolver } from './resolvers/game-lobby.resolver';
import { LeaderboardComponent } from './components/leaderboard/leaderboard.component';
import { LobbiesComponent } from './components/lobbies/lobbies.component';
import { LoginComponent } from './components/login/login.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'lobbies',
    component: LobbiesComponent,
    resolve: { data: LobbiesResolver },
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
  {
    path: 'login',
    component: LoginComponent,
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [GameLobbyResolver, LobbiesResolver, LeaderboardResolver, UserProfileResolver],
})
export class AppRoutingModule {}

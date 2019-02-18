import { EditLobbyResolver } from './resolvers/edit-lobby.resolver';
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
import { FaqComponent } from './components/faq/faq.component';
import { CreateLobbyComponent } from './components/create-lobby/create-lobby.component';
import { EditLobbyComponent } from './components/edit-lobby/edit-lobby.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'lobbies',
    component: LobbiesComponent,
    resolve: { data: LobbiesResolver },
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'lobbies/create',
    component: CreateLobbyComponent,
  },
  {
    path: 'lobbies/:id/edit',
    component: EditLobbyComponent,
    resolve: { data: EditLobbyResolver },
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'lobbies/:id',
    component: GameLobbyComponent,
    resolve: { data: GameLobbyResolver },
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'leaderboard',
    component: LeaderboardComponent,
    resolve: { data: LeaderboardResolver },
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'user/:username',
    component: UserProfileComponent,
    resolve: { data: UserProfileResolver },
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'faq',
    component: FaqComponent,
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {enableTracing: false, onSameUrlNavigation: 'reload'})],
  exports: [RouterModule],
  providers: [GameLobbyResolver, LobbiesResolver, LeaderboardResolver, UserProfileResolver, EditLobbyResolver],
})
export class AppRoutingModule {}

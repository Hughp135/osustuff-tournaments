import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GameLobbyComponent } from './components/game-lobby/game-lobby.component';
import { ApiService } from './services/api.service';
import { GameInfoComponent } from './components/game-lobby/game-info/game-info.component';
import { BeatmapInfoComponent } from './components/game-lobby/beatmap-info/beatmap-info.component';
import { ScoresListComponent } from './components/game-lobby/scores-list/scores-list.component';
import { UserListComponent } from './components/game-lobby/user-list/user-list.component';
import { ChatComponent } from './components/game-lobby/chat/chat.component';
import { LobbiesListComponent } from './components/lobbies-list/lobbies-list.component';
import { JoinGameComponent } from './components/game-lobby/join-game/join-game.component';
import { SettingsService } from './services/settings.service';
import { BeatmapListComponent } from './components/game-lobby/beatmap-list/beatmap-list.component';
import { GameStatusComponent } from './components/game-lobby/game-status/game-status.component';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { EmojifyModule } from 'angular-emojify';
import { LazyLoadImageModule, intersectionObserverPreset } from 'ng-lazyload-image';
import { ScoresTableComponent } from './components/game-lobby/scores-list/scores-table/scores-table.component';
import { OrdinalPipe } from './pipes/ordinal.pipe';
import { MatchResultsComponent } from './components/game-lobby/match-results/match-results.component';
import { LeaderboardComponent } from './components/leaderboard/leaderboard.component';
import { HomeComponent } from './components/home/home.component';
import { FooterComponent } from './components/footer/footer.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { SuiModule } from 'ng2-semantic-ui';
import { LobbiesComponent } from './components/lobbies/lobbies.component';
import { TwitchEmotesPipe } from 'src/pipes/twitch-emotes.pipe';
import { TwemojifyPipe } from 'src/pipes/twemojify.pipe';
import { EscapePipe } from 'src/pipes/escape.pipe';
import { LoginComponent } from './components/login/login.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { FaqComponent } from './components/faq/faq.component';
import { DatePipe } from '@angular/common';
import { UsernameHighlightPipe } from '../pipes/username-highlight.pipe';
import { CreateLobbyComponent } from './components/create-lobby/create-lobby.component';
import { GameDescriptionComponent } from './components/game-lobby/game-description/game-description.component';
import { UserPopupComponent } from './components/game-lobby/user-list/user-popup/user-popup.component';
import { LobbyFormComponent } from './components/lobby-form/lobby-form.component';
import { EditLobbyComponent } from './components/edit-lobby/edit-lobby.component';
import { PageLoaderComponent } from './components/page-loader/page-loader.component';

@NgModule({
  declarations: [
    OrdinalPipe,
    AppComponent,
    GameLobbyComponent,
    GameInfoComponent,
    BeatmapInfoComponent,
    ScoresListComponent,
    UserListComponent,
    ChatComponent,
    LobbiesListComponent,
    JoinGameComponent,
    BeatmapListComponent,
    GameStatusComponent,
    ScoresTableComponent,
    MatchResultsComponent,
    LeaderboardComponent,
    HomeComponent,
    FooterComponent,
    UserProfileComponent,
    LobbiesComponent,
    TwitchEmotesPipe,
    TwemojifyPipe,
    UsernameHighlightPipe,
    EscapePipe,
    LoginComponent,
    NotificationsComponent,
    FaqComponent,
    CreateLobbyComponent,
    GameDescriptionComponent,
    UserPopupComponent,
    LobbyFormComponent,
    EditLobbyComponent,
    PageLoaderComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    PickerModule,
    EmojifyModule,
    LazyLoadImageModule.forRoot({
      preset: intersectionObserverPreset,
    }),
    SuiModule,
  ],
  providers: [ApiService, SettingsService, DatePipe],
  bootstrap: [AppComponent],
})
export class AppModule {}

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GameLobbyComponent } from './components/game-lobby/game-lobby.component';
import { ApiService } from './services/api.service';

@NgModule({
  declarations: [AppComponent, GameLobbyComponent],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule],
  providers: [ApiService],
  bootstrap: [AppComponent]
})
export class AppModule {}

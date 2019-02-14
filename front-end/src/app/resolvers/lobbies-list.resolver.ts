import { ApiService } from './../services/api.service';
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { GameService } from '../game.service';
import { SettingsService } from '../services/settings.service';

@Injectable({
  providedIn: 'root',
})
export class LobbiesResolver implements Resolve<any> {
  constructor(
    private gameService: GameService,
    private settingsService: SettingsService,
    private apiService: ApiService,
  ) {}

  async resolve(): Promise<Observable<any> | any> {
    await this.settingsService.checkCurrentGame();
    const { onlinePlayers } = <{onlinePlayers: number}>await this.apiService.get('online-players');

    return {
      lobbies: await this.gameService.getLobbies(),
      onlinePlayers,
    };
  }
}

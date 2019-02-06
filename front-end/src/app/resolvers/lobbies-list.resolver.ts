import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { GameService } from '../game.service';
import { SettingsService } from '../services/settings.service';

@Injectable({
  providedIn: 'root',
})
export class LobbiesResolver implements Resolve<any> {
  constructor(private gameService: GameService, private settingsService: SettingsService) {}

  async resolve(): Promise<Observable<any> | any> {
    await this.settingsService.checkCurrentGame();

    return {
      lobbies: await this.gameService.getLobbies(),
    };
  }
}

import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { GameService } from '../game.service';
import { SettingsService } from '../services/settings.service';

@Injectable({
  providedIn: 'root'
})
export class GameLobbyResolver implements Resolve<any> {
  constructor(
    private gameService: GameService,
    private router: Router,
    private settingsService: SettingsService
  ) {}

  async resolve(route: ActivatedRouteSnapshot): Promise<Observable<any> | any> {
    const { id } = route.params;

    try {
      const lobby = await this.gameService.getLobby(id);
      const beatmaps = await this.gameService.getLobbyBeatmaps(id);
      const players = await this.gameService.getLobbyUsers(id);

      await this.settingsService.checkCurrentGame();

      return {
        lobby,
        beatmaps,
        players
      };
    } catch (e) {
      setTimeout(() => this.router.navigate(['']), 0);
      return { lobby: undefined };
    }
  }
}

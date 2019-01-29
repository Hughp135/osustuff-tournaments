import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { GameService } from '../game.service';

@Injectable({
  providedIn: 'root'
})
export class GameLobbyResolver implements Resolve<any> {
  constructor(private gameService: GameService) {}

  async resolve(
    router: ActivatedRouteSnapshot
  ): Promise<Observable<any> | any> {
    return {
      lobbies: await this.gameService.getLobbies()
    };
  }
}

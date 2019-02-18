import { GameService } from './../game.service';
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EditLobbyResolver implements Resolve<any> {
  constructor(private gameService: GameService) {}

  async resolve(route: ActivatedRouteSnapshot): Promise<Observable<any> | any> {
    const { id } = route.params;

    return {
      lobby: await this.gameService.getLobby(id),
      beatmaps: await this.gameService.getLobbyBeatmaps(id),
    };
  }
}

import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { GameService } from '../game.service';

@Injectable({
  providedIn: 'root'
})
export class LobbiesResolver implements Resolve<any> {
  constructor(private gameService: GameService) {}

  async resolve(): Promise<Observable<any> | any> {
    return {
      lobbies: await this.gameService.getLobbies()
    };
  }
}

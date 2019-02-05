import { ApiService } from './api.service';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CurrentGame {
  gameId: string;
}

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  public currentGame: BehaviorSubject<CurrentGame> = new BehaviorSubject(undefined);
  public username: BehaviorSubject<string> = new BehaviorSubject(undefined);

  constructor(private apiService: ApiService) {
    this.checkCurrentGame();
    (<any>window).adminLogon = password => {
      this.setAdmin(password);
    };
  }

  public async checkCurrentGame() {
      try {
        const me: any = await this.apiService.get(`user/me`).toPromise();

        if (me) {
          this.setUsername(me.username);
          if (me.currentGame) {
            this.setCurrentGame(me.currentGame);
          } else {
            this.clearCurrentGame();
          }
        } else {
          this.clearCurrentGame();
        }

      } catch (e) {
        if ([404, 408, 401].includes(e.status)) {
          this.clearUsername();
          this.clearCurrentGame();
        } else {
          console.error(e);
        }
      }
  }

  public setCurrentGame(gameId: string) {
    const currentGame = {
      gameId,
    };
    localStorage.setItem('currentGame', JSON.stringify(currentGame));

    this.currentGame.next(currentGame);
  }

  public clearCurrentGame() {
    localStorage.removeItem('currentGame');
    if (this.currentGame.getValue() !== undefined) {
      this.currentGame.next(undefined);
    }
  }

  private getCurrentGame(): CurrentGame | null {
    return JSON.parse(localStorage.getItem('currentGame') || 'null');
  }

  public setUsername(username: string) {
    localStorage.setItem('username', username);
    this.username.next(username);
  }

  private clearUsername() {
    localStorage.removeItem('username');
    this.username.next(undefined);
  }

  public setAdmin(password: string) {
    localStorage.setItem('adminPw', password);
  }

  get adminPw(): string | undefined {
    return localStorage.getItem('adminPw');
  }

  public async leaveGame(gameId: string) {
    const currentGame = this.currentGame.getValue();

    if (!currentGame) {
      return;
    }

    await this.apiService.post(`lobbies/${gameId}/leave`, {}).toPromise();

    this.clearCurrentGame();
  }
}

import { IUser } from './../components/user-profile/user-profile.component';
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
  public user: BehaviorSubject<IUser | undefined> = new BehaviorSubject(undefined);

  constructor(private apiService: ApiService) {
    this.checkCurrentGame();
    (<any>window).adminLogon = password => {
      this.setAdmin(password);
    };
  }

  public async checkCurrentGame() {
      try {
        const me: any = await this.apiService.get(`user/me`);

        if (me) {
          this.user.next(me);
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

    await this.apiService.post(`lobbies/${gameId}/leave`, {});

    this.clearCurrentGame();
  }
}

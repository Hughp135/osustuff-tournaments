import { ApiService } from './api.service';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CurrentGame {
  gameId: string;
  requestId: string;
}

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  public currentGame: BehaviorSubject<CurrentGame> = new BehaviorSubject(undefined);
  public username: BehaviorSubject<string> = new BehaviorSubject(undefined);

  constructor(private apiService: ApiService) {
    this.checkCurrentGame();
    this.username.next(localStorage.getItem('username') || undefined);
    (<any>window).adminLogon = password => {
      this.setAdmin(password);
    };
  }

  public async getUser() {
    if (!this.username.getValue()) {
      return;
    }

    try {
      return await this.apiService.get(`user/${this.username}`).toPromise();
    } catch (e) {
      console.error(e);
    }
  }

  public async checkCurrentGame() {
    const currentGame = this.getCurrentGame();

    if (currentGame) {
      try {
        const { verified }: any = await this.apiService
          .post(`check-verified`, {
            requestId: currentGame.requestId,
          })
          .toPromise();
        if (verified) {
          this.currentGame.next(currentGame);
        } else {
          this.clearCurrentGame();
        }
      } catch (e) {
        if ([404, 408].includes(e.status)) {
          this.clearCurrentGame();
        } else {
          console.error(e);
        }
      }
    }
  }

  public setCurrentGame(gameId: string, requestId: string) {
    const currentGame = {
      gameId,
      requestId,
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

  public setAdmin(password: string) {
    localStorage.setItem('adminPw', password);
  }

  get adminPw(): string | undefined {
    return localStorage.getItem('adminPw');
  }

  public async leaveGame(gameId: string) {
    const currentGame = this.currentGame.getValue();
    console.log('currentGame', currentGame);
    if (!currentGame) {
      return;
    }

    await this.apiService
      .post(`lobbies/${gameId}/leave`, {
        requestId: currentGame.requestId,
      })
      .toPromise();

    this.clearCurrentGame();
  }
}

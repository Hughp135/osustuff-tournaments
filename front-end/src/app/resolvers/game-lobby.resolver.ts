import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, interval, Observer, Subscription, BehaviorSubject } from 'rxjs';
import { GameService } from '../game.service';
import { SettingsService, CurrentGame } from '../services/settings.service';
import { IGame, IPlayer } from '../components/game-lobby/game-lobby.component';
import * as Visibility from 'visibilityjs';
import { Message } from '../components/game-lobby/chat/chat.component';
import { takeWhile } from 'rxjs/operators';

export interface GameLobbyData {
  lobby: Observable<IGame>;
  beatmaps: any;
  players: Observable<IPlayer[]>;
  messages: Message[];
  timeLeft: Observable<string>;
}

@Injectable({
  providedIn: 'root',
})
export class GameLobbyResolver implements Resolve<Promise<GameLobbyData>> {
  private _game: BehaviorSubject<IGame> = new BehaviorSubject(undefined);
  private statusChanged: BehaviorSubject<undefined> = new BehaviorSubject(undefined);
  private _players: IPlayer[] = [];
  public currentGame: CurrentGame;
  public visibilityTimers: number[] = [];
  private timeLeft: BehaviorSubject<string | undefined> = new BehaviorSubject(undefined);
  private timeLeftInterval: Subscription;
  private secondsLeft?: number;

  constructor(
    private gameService: GameService,
    private router: Router,
    private settingsService: SettingsService
  ) {}

  async resolve(route: ActivatedRouteSnapshot): Promise<GameLobbyData> {
    const { id } = route.params;

    try {
      const beatmaps = await this.gameService.getLobbyBeatmaps(id);
      const messages = await this.gameService.getLobbyMessages(id);
      const lobby: Observable<IGame> = this.getLobby(id);
      const players: Observable<IPlayer[]> = this.getPlayers(id);

      await this.settingsService.checkCurrentGame();

      return {
        lobby,
        beatmaps,
        players,
        messages,
        timeLeft: this.timeLeft,
      };
    } catch (e) {
      console.error(e);
      setTimeout(() => this.router.navigate(['/lobbies']), 0);
      return undefined;
    }
  }

  private getPlayers(gameId: string) {
    return Observable.create(async (observer: Observer<IPlayer[]>) => {
      let fetching = false;
      const subs: Subscription = new Subscription();

      const updatePlayers = async (forceUpdate?: boolean) => {
        if (observer.closed) {
          subs.unsubscribe();
          observer.complete();
        }
        if (fetching) {
          return;
        }

        fetching = true;
        try {
          const players = await this.gameService.getLobbyUsers(gameId);
          if (forceUpdate || players.length !== this._players.length) {
            this._players = players;
            observer.next(players);
          }
        } catch (e) {
          console.error(e);
        }
        fetching = false;
      };

      subs.add(
        this.statusChanged.subscribe(async () => {
          await updatePlayers(true);
        })
      );

      subs.add(
        this.settingsService.currentGame.subscribe(async () => {
          await updatePlayers(true);
        })
      );

      subs.add(
        this.getTimer(5000, 15000)
          .pipe(
            takeWhile(() => {
              const game = this._game.getValue();

              return game && game._id === gameId && game.status === 'new';
            })
          )
          .subscribe(async () => {
            await updatePlayers();
          })
      );
    });
  }

  private getLobby(id: string): Observable<IGame> {
    return Observable.create(async (observer: Observer<IGame>) => {
      let fetching = false;
      const subscriptions = new Subscription();

      const updateGame = async () => {
        if (observer.closed) {
          subscriptions.unsubscribe();
          observer.complete();
          this._game.next(undefined);
          this.statusChanged.next(undefined);

          return;
        }

        if (fetching) {
          return;
        }

        fetching = true;
        try {
          const game = await this.gameService.getLobby(id);
          const statusChanged =
            !this._game.getValue() || game.status !== this._game.getValue().status;

          observer.next(game);
          this._game.next(game);

          if (statusChanged) {
            this.statusChanged.next(undefined);
          }

          if (statusChanged || !this.secondsLeft) {
            this.secondsLeft = game.secondsToNextRound;
            if (this.timeLeftInterval) {
              this.timeLeftInterval.unsubscribe();
            }
            this.updateTimeLeft();
            this.timeLeftInterval = interval(1000).subscribe(() => {
              if (this.secondsLeft >= 1) {
                this.secondsLeft--;
                this.updateTimeLeft();
              }
            });
          }
        } catch (e) {
          console.error(e);
        }
        fetching = false;
      };

      // Fetch when currentGame changes
      subscriptions.add(
        this.settingsService.currentGame.subscribe(async val => {
          await updateGame();
        })
      );

      // Fetch on an interval
      subscriptions.add(
        this.getTimer(5000, 15000).subscribe(async () => {
          await updateGame();
        })
      );
    });
  }

  private getTimer(timeVisible: number, timeHidden: number): Observable<undefined> {
    return Observable.create(observer => {
      let visibleCbSet = false;
      let timeout;
      const tick = () => {
        const hidden = Visibility.hidden();
        const time = hidden ? timeHidden : timeVisible;

        if (hidden && !visibleCbSet) {
          visibleCbSet = true;
          Visibility.onVisible(async () => {
            clearTimeout(timeout);
            observer.next();
            tick();
            visibleCbSet = false;
          });
        }
        timeout = setTimeout(async () => {
          observer.next();

          tick();
        }, time);
      };
      tick();
    });
  }

  private updateTimeLeft(): void {
    if (!this.secondsLeft) {
      this.timeLeft.next(undefined);
      return;
    }

    if (this.secondsLeft < 0) {
      this.timeLeft.next('now');
      return;
    }

    const date = new Date();
    date.setSeconds(date.getSeconds() + this.secondsLeft);
    const { hours, seconds, minutes } = getTimeComponents(date.getTime() - Date.now());

    this.timeLeft.next(`${hours ? `${hours}:` : ''}${minutes}:${seconds}`);
  }
}

export function getTimeComponents(t: number) {
  const seconds = Math.floor((t / 1000) % 60);
  const minutes = Math.max(0, Math.floor((t / 1000 / 60) % 60));
  const hours = Math.max(0, Math.floor((t / (1000 * 60 * 60)) % 24));
  const days = Math.max(0, Math.floor(t / (1000 * 60 * 60 * 24)));

  return {
    total: t,
    days: days.toString(),
    hours: hours.toString().padStart(2, '0'),
    minutes: minutes.toString().padStart(2, '0'),
    seconds: seconds.toString().padStart(2, '0'),
  };
}

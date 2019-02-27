import { WebsocketService } from './../services/websocket.service';
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import {
  Observable,
  interval,
  Observer,
  Subscription,
  BehaviorSubject,
} from 'rxjs';
import { GameService } from '../game.service';
import { SettingsService, CurrentGame } from '../services/settings.service';
import { IGame, IPlayer } from '../components/game-lobby/game-lobby.component';
import * as Visibility from 'visibilityjs';
import { Message } from '../components/game-lobby/chat/chat.component';
import { filter, throttleTime } from 'rxjs/operators';
import { IBeatmap } from '../components/create-lobby/create-lobby.component';

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
  private statusChanged: BehaviorSubject<undefined> = new BehaviorSubject(
    undefined,
  );
  public currentGame: CurrentGame;
  public visibilityTimers: number[] = [];
  private timeLeft: BehaviorSubject<string | undefined> = new BehaviorSubject(
    undefined,
  );
  private timeLeftInterval: Subscription;
  private secondsLeft?: number;
  private beatmaps: BehaviorSubject<IBeatmap[]> = new BehaviorSubject([]);

  constructor(
    private gameService: GameService,
    private settingsService: SettingsService,
    private socketService: WebsocketService,
  ) {}

  async resolve(route: ActivatedRouteSnapshot): Promise<GameLobbyData> {
    const { id } = route.params;

    try {
      await this.socketService.connect(id);
      await this.getBeatmaps(id);
      const messages = await this.gameService.getLobbyMessages(id);
      const lobby: Observable<IGame> = this.getLobby();
      const players: Observable<IPlayer[]> = this.getPlayers(id);

      await this.settingsService.checkCurrentGame();
      return {
        lobby,
        beatmaps: this.beatmaps,
        players,
        messages,
        timeLeft: this.timeLeft,
      };
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }

  private async getBeatmaps(gameId: string) {
    this.beatmaps.next(await this.gameService.getLobbyBeatmaps(gameId));
  }

  private getPlayers(gameId: string) {
    return Observable.create(async (observer: Observer<IPlayer[]>) => {
      const subscriptions: Subscription = new Subscription();

      const updatePlayers = (players, id) => {
        if (observer.closed) {
          subscriptions.unsubscribe();
          observer.complete();

          return;
        }

        observer.next(players);
      };
      subscriptions.add(
        this.socketService.players
          .pipe(
            filter(val => !!val),
            throttleTime(1000)
          )
          .subscribe(({ players, gameId: id }) => {
            updatePlayers(players, id);
          }),
      );
    });
  }

  private getLobby(): Observable<IGame> {
    return Observable.create(async (observer: Observer<IGame>) => {
      const subscriptions = new Subscription();

      const onData = (game: IGame) => {
        if (observer.closed) {
          subscriptions.unsubscribe();
          observer.complete();
          this._game.next(undefined);
          this.statusChanged.next(undefined);

          return;
        }

        observer.next(game);

        const statusChanged =
          !this._game.getValue() ||
          game.status !== this._game.getValue().status;

        this._game.next(game);

        if (
          game.status === 'new' ||
          statusChanged ||
          Math.abs(game.secondsToNextRound - this.secondsLeft) > 10
        ) {
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
      };
      subscriptions.add(
        this.socketService.lobby.subscribe(game => {
          if (game) {
            onData(game);
          }
        }),
      );
    });
  }

  private getTimer(
    timeVisible: number,
    timeHidden: number,
  ): Observable<undefined> {
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
    const { days, hours, seconds, minutes } = getTimeComponents(
      date.getTime() - Date.now(),
    );

    this.timeLeft.next(
      `${parseInt(days, 10) > 0 ? `${days}d ` : ''}${
        hours ? `${hours}:` : ''
      }${minutes}:${seconds}`,
    );
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

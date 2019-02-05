import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, interval, Observer, Subscription, BehaviorSubject } from 'rxjs';
import { GameService } from '../game.service';
import { SettingsService, CurrentGame } from '../services/settings.service';
import {
  IGame,
  IPlayer,
  getTimeComponents,
} from '../components/game-lobby/game-lobby.component';
import * as Visibility from 'visibilityjs';
import { Message } from '../components/game-lobby/chat/chat.component';
import { distinctUntilChanged, takeWhile } from 'rxjs/operators';

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
    private settingsService: SettingsService,
  ) {}

  async resolve(route: ActivatedRouteSnapshot): Promise<GameLobbyData> {
    const { id } = route.params;

    try {
      // this.game = await this.gameService.getLobby(id);
      const beatmaps = await this.gameService.getLobbyBeatmaps(id);
      // const players = await this.gameService.getLobbyUsers(id);
      const messages = await this.gameService.getLobbyMessages(id);
      // const gameFetchInterval =   Visibility.every(gameFetchInterval, gameFetchInterval * 3, async () => {
      //   await this.fetch();
      // });
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
      setTimeout(() => this.router.navigate(['']), 0);
      return undefined;
    }
  }

  private getPlayers(gameId: string) {
    return Observable.create(async (observer: Observer<IPlayer[]>) => {
      let fetching = false;
      let statusSub: Subscription;

      const updatePlayers = async (forceUpdate?: boolean) => {
        if (observer.closed) {
          console.log('unsubbing');
          statusSub.unsubscribe();
          observer.complete();
        }
        if (fetching) {
          return;
        }

        fetching = true;
        const players = await this.gameService.getLobbyUsers(gameId);
        if (forceUpdate || players.length !== this._players.length) {
          console.log('setting players');
          this._players = players;
          observer.next(players);
        } else {
          console.log('not setting players');
        }
        fetching = false;
      };

      statusSub = this.statusChanged.subscribe(async () => {
          await updatePlayers(true);
      });

      this.getTimer(5000, 15000)
        .pipe(
          takeWhile(() => {
            const game = this._game.getValue();
            return !game || game.status === 'new';
          }),
        )
        .subscribe(async () => {
          await updatePlayers();
        });
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
          return;
        }

        if (fetching) {
          return;
        }

        fetching = true;
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
        fetching = false;
      };

      // Fetch when currentGame changes
      subscriptions.add(
        this.settingsService.currentGame.subscribe(async val => {
          await updateGame();
        }),
      );

      // Fetch on an interval
      subscriptions.add(
        this.getTimer(5000, 15000).subscribe(async () => {
          await updateGame();
        }),
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
    if (this.secondsLeft || this.secondsLeft < 0) {
      this.timeLeft.next(undefined);
    }

    const date = new Date();
    date.setSeconds(date.getSeconds() + this.secondsLeft);
    const { seconds, minutes } = getTimeComponents(date.getTime() - Date.now());

    this.timeLeft.next(`${minutes}:${seconds}`);
  }
}

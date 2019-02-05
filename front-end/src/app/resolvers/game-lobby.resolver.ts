import { Injectable, OnDestroy } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import {
  Observable,
  interval,
  Subscriber,
  Observer,
  Subscription,
  Subject,
  BehaviorSubject,
  merge,
} from 'rxjs';
import { GameService } from '../game.service';
import { SettingsService, CurrentGame } from '../services/settings.service';
import { IGame, IPlayer, getTimeComponents } from '../components/game-lobby/game-lobby.component';
import * as Visibility from 'visibilityjs';
import { Message } from '../components/game-lobby/chat/chat.component';
import { distinctUntilChanged, filter, mergeMap } from 'rxjs/operators';

declare var responsiveVoice: any;

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
export class GameLobbyResolver implements Resolve<Promise<GameLobbyData>>, OnDestroy {
  private _game: BehaviorSubject<IGame> = new BehaviorSubject(undefined);
  private _players: IPlayer[] = [];
  public currentGame: CurrentGame;
  public visibilityTimers: number[] = [];
  private gameFetchInterval = 5000;
  private timeLeft: BehaviorSubject<string | undefined> = new BehaviorSubject(undefined);

  constructor(
    private gameService: GameService,
    private router: Router,
    private settingsService: SettingsService
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
      interval(1000).subscribe(() => this.updateTimeLeft());

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

  ngOnDestroy() {
    console.log('destroyed');
  }

  private getPlayers(gameId: string) {
    return Observable.create(async (observer: Observer<IPlayer[]>) => {
      let fetching = false;
      const subscriptions: Subscription = new Subscription();

      const updatePlayers = async (game: IGame) => {
        if (observer.closed) {
          subscriptions.unsubscribe();
          observer.complete();
        }
        if (fetching) {
          return;
        }
        fetching = true;
        const players = await this.gameService.getLobbyUsers(gameId);
        if (!game || game.status !== 'new' || players.length !== this._players.length) {
          this._players = players;
          observer.next(players);
        }
        fetching = false;
      };

      subscriptions.add(
        this._game
          .pipe(
            distinctUntilChanged((a, b) => {
              return !a || (b.status === a.status && b.status !== 'new');
            })
          )
          .subscribe(async game => {
            await updatePlayers(game);
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
          return;
        }

        if (fetching) {
          console.log('not fetching');
          return;
        }

        console.log('fetching');
        fetching = true;
        const game = await this.gameService.getLobby(id);
        observer.next(game);
        this._game.next(game);
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
          console.log('setting onVisible cb');
          visibleCbSet = true;
          Visibility.onVisible(async () => {
            console.log('visible callback');
            clearTimeout(timeout);
            observer.next();
            tick();
            visibleCbSet = false;
          });
        }
        timeout = setTimeout(async () => {
          console.log('tick');
          observer.next();

          tick();
        }, time);
      };
      tick();
    });
  }

  private updateTimeLeft(): void {
    const game = this._game.getValue();
    const subject = new Subject();

    if (!game || !game.secondsToNextRound) {
      this.timeLeft.next(undefined);
    }

    const date = new Date();
    date.setSeconds(date.getSeconds() + game.secondsToNextRound);
    const { seconds, minutes } = getTimeComponents(date.getTime() - Date.now());

    this.timeLeft.next(`${minutes}:${seconds}`);
  }
}

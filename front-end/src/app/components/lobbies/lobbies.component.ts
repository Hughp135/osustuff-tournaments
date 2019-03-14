import { SettingsService } from './../../services/settings.service';
import { ApiService } from 'src/app/services/api.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, interval } from 'rxjs';
import { getTimeComponents } from 'src/app/resolvers/game-lobby.resolver';
import { GameService } from '../../game.service';
import { IGame } from '../game-lobby/game-lobby.component';

@Component({
  selector: 'app-lobbies',
  templateUrl: './lobbies.component.html',
  styleUrls: ['./lobbies.component.scss'],
})
export class LobbiesComponent implements OnInit, OnDestroy {
  private allLobbies: IGame[];
  public lobbies: IGame[];
  public subscriptions: Subscription[] = [];
  public fetching = false;
  public onlinePlayersCount: number;
  public canCreate = false;
  public showGameModes: { [key in '0' | '1' | '2' | '3']: boolean } = {
    '0': true,
    '1': false,
    '2': false,
    '3': false,
  };

  constructor(
    private route: ActivatedRoute,
    private gameService: GameService,
    private apiService: ApiService,
    private settingsService: SettingsService,
  ) {
    const enabledGameModes = settingsService.getGameModes();
    const notEnabled = Object.keys(this.showGameModes).filter(
      (k: any) => !enabledGameModes.includes(k),
    );

    for (const k of notEnabled) {
      this.showGameModes[k] = false;
    }

    for (const mode of enabledGameModes) {
      this.showGameModes[mode] = true;
    }
  }

  ngOnInit() {
    this.route.data.subscribe(({ data }) => {
      this.allLobbies = data.lobbies;
      this.applyGameModeFilters();
      this.onlinePlayersCount = data.onlinePlayers;
      this.setLobbiesStartString();
    });

    this.subscriptions.push(
      interval(1000).subscribe(() => {
        this.lobbies
          .filter(
            l =>
              l.startsAt !== undefined &&
              ['new', 'scheduled'].includes(l.status),
          )
          .forEach(l => {
            l.startsAt--;
          });
        this.setLobbiesStartString();
      }),
    );

    this.subscriptions.push(
      interval(30000).subscribe(() => {
        this.fetch();
      }),
    );

    this.subscriptions.push(
      this.settingsService.user.subscribe(user => {
        this.canCreate =
          user &&
          (user.roles.includes('creator') || user.roles.includes('admin'));
      }),
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  public applyGameModeFilters() {
    const gameModes = <Array<'0' | '1' | '2' | '3'>>(
      Object.keys(this.showGameModes)
    );
    this.settingsService.setGameModes(
      gameModes.filter(k => !!this.showGameModes[k]),
    );
    const enabledGameModes = Object.keys(this.showGameModes)
      .map(key => {
        const value = this.showGameModes[key];
        if (value) {
          return key;
        }
      })
      .filter(k => !!k);
    this.lobbies = enabledGameModes.length
      ? this.allLobbies.filter(({ gameMode }) =>
          [undefined, ...enabledGameModes].includes(gameMode),
        )
      : this.allLobbies;
  }

  get scheduledGames() {
    return this.lobbies.filter(l => l.status === 'scheduled');
  }

  get joinableGames() {
    return this.lobbies.filter(l => ['new'].includes(l.status));
  }

  get inProgressGames() {
    return this.lobbies.filter(
      l => !['new', 'scheduled', 'complete'].includes(l.status),
    );
  }

  get completedGames() {
    return this.lobbies.filter(l => l.status === 'complete');
  }

  public setLobbiesStartString() {
    this.lobbies
      .filter(l => ['new', 'scheduled'].includes(l.status))
      .forEach(lobby => {
        const date = new Date();
        date.setSeconds(date.getSeconds() + lobby.startsAt);
        const { days, seconds, minutes, hours } = getTimeComponents(
          date.getTime() - Date.now(),
        );

        if (parseInt(seconds, 10) < 0) {
          return (lobby.startsAtString = `now`);
        }

        lobby.startsAtString = `${parseInt(days, 10) > 0 ? `${days}d ` : ''}${
          parseInt(hours, 10) > 0 ? `${hours}:` : ''
        }${minutes}:${seconds}s`;
      });
  }

  public async fetch() {
    if (this.fetching) {
      return;
    }

    this.fetching = true;
    try {
      this.lobbies = await this.gameService.getLobbies();
      this.onlinePlayersCount = (<{ onlinePlayers: number }>(
        await this.apiService.get('online-players')
      )).onlinePlayers;
    } catch (e) {
      console.error(e);
    }
    this.fetching = false;
  }
}

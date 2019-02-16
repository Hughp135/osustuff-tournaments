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
  public lobbies: IGame[];
  public subscriptions: Subscription[] = [];
  public fetching = false;
  public onlinePlayersCount: number;
  public canCreate = false;

  constructor(
    private route: ActivatedRoute,
    private gameService: GameService,
    private apiService: ApiService,
    private settingsService: SettingsService,
  ) {}

  ngOnInit() {
    this.route.data.subscribe(({ data }) => {
      this.lobbies = data.lobbies;
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
        this.canCreate = user.roles.includes('creator');
      }),
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
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
        const { seconds, minutes, hours } = getTimeComponents(
          date.getTime() - Date.now(),
        );

        if (parseInt(seconds, 10) < 0) {
          return (lobby.startsAtString = `now`);
        }

        lobby.startsAtString = `${
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

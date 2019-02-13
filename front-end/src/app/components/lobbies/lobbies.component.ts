import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, interval } from 'rxjs';
import { getTimeComponents } from 'src/app/resolvers/game-lobby.resolver';
import { GameService } from '../../game.service';

@Component({
  selector: 'app-lobbies',
  templateUrl: './lobbies.component.html',
  styleUrls: ['./lobbies.component.scss'],
})
export class LobbiesComponent implements OnInit, OnDestroy {
  public lobbies: any[];
  public subscriptions: Subscription[] = [];
  public fetching = false;

  constructor(
    private route: ActivatedRoute,
    private gameService: GameService,
  ) {}

  ngOnInit() {
    this.route.data.subscribe(({ data }) => {
      this.lobbies = data.lobbies;
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
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  get joinableGames() {
    return this.lobbies.filter(l => ['new', 'scheduled'].includes(l.status));
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
    } catch (e) {
      console.error(e);
    }
    this.fetching = false;
  }
}

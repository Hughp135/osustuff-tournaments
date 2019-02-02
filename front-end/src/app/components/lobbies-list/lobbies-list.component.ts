import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { getTimeComponents } from '../game-lobby/game-lobby.component';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-lobbies-list',
  templateUrl: './lobbies-list.component.html',
  styleUrls: ['./lobbies-list.component.scss'],
})
export class LobbiesListComponent implements OnInit, OnDestroy {
  public lobbies: any[];
  public subscriptions: Subscription[] = [];

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    const { data } = this.route.snapshot.data;

    this.lobbies = data.lobbies;
    this.setLobbiesStartString();

    this.subscriptions.push(
      interval(1000).subscribe(() => {
        this.lobbies
          .filter(l => l.status === 'new')
          .forEach(l => {
            l.startsAt--;
          });
        this.setLobbiesStartString();
      }),
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  get joinableGames() {
    return this.lobbies.filter(l => l.status === 'new');
  }

  get inProgressGames() {
    return this.lobbies.filter(l => !['new', 'complete'].includes(l.status));
  }

  get completedGames() {
    return this.lobbies.filter(l => l.status === 'complete');
  }

  public getStatus(game) {
    switch (game.status) {
      case 'new':
        return 'Waiting for more players';
      case 'complete':
        return 'Finished';
      default:
        return 'In Progress';
    }
  }

  public setLobbiesStartString() {
    this.lobbies
      .filter(l => l.status === 'new')
      .forEach(lobby => {
        const date = new Date();
        date.setSeconds(date.getSeconds() + lobby.startsAt);
        const { seconds, minutes } = getTimeComponents(date.getTime() - Date.now());

        if (parseInt(seconds, 10) < 0) {
          return (lobby.startsAtString = `now`);
        }

        lobby.startsAtString = `${minutes}:${seconds}s`;
      });
  }

  public getLobbyIconClass(lobby) {
    switch (lobby.status) {
      case 'new':
        return 'green play';
      case 'complete':
        return 'grey flag checkered';
      default:
        return 'orange eye';
    }
  }
}

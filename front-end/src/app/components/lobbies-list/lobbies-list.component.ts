import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { getTimeComponents } from '../game-lobby/game-lobby.component';

@Component({
  selector: 'app-lobbies-list',
  templateUrl: './lobbies-list.component.html',
  styleUrls: ['./lobbies-list.component.scss'],
})
export class LobbiesListComponent implements OnInit {
  public lobbies: any[];

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    const { data } = this.route.snapshot.data;

    this.lobbies = data.lobbies;
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

  public getTimeLeft(timeLeftSeconds: number) {
    const date = new Date();
    date.setSeconds(date.getSeconds() + timeLeftSeconds);
    const { seconds, minutes } = getTimeComponents(date.getTime() - Date.now());

    if (parseInt(seconds, 10) < 0) {
      return 'now';
    }

    return `${minutes}:${seconds}`;
  }

  public getLobbyColor(lobby) {
    switch (lobby.status) {
      case 'new':
        return 'green';
      default:
        return 'grey';
    }
  }
}

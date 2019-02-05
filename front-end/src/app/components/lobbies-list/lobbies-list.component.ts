import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-lobbies-list',
  templateUrl: './lobbies-list.component.html',
  styleUrls: ['./lobbies-list.component.scss']
})
export class LobbiesListComponent implements OnInit {
  @Input() lobbies: any[];

  constructor() { }

  ngOnInit() {
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

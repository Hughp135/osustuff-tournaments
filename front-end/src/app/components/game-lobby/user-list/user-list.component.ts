import { IPlayer } from './../game-lobby.component';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
})
export class UserListComponent implements OnInit {
  @Input() players: IPlayer[];
  @Input() winningUser: string;
  @Input() currentUser: string;

  public hiddenPlayers: number;

  constructor() {}

  ngOnInit() {}

  get alivePlayers() {
    return this.players.filter(p => p.alive);
  }

  get sortedPlayers() {
    const filtered = this.players.sort((a, b) => {
      if (a.username === this.currentUser) {
        return -1;
      }

      if (a.gameRank && b.gameRank) {
        return a.gameRank - b.gameRank;
      }

      if (a.gameRank) {
        return 1;
      }
      if (b.gameRank) {
        return -1;
      }

      return a.ppRank - b.ppRank;
    }).slice(0, 200);

    if (filtered.length < this.players.length) {
      this.hiddenPlayers = this.players.length - filtered.length;
    }

    return filtered;
  }
}

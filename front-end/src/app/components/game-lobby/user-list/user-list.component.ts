import { IPlayer } from './../game-lobby.component';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  @Input() players: IPlayer[];
  @Input() winningUser: string;
  @Input() currentUser: string;

  constructor() {}

  ngOnInit() {}

  get alivePlayers() {
    return this.players.filter(p => p.alive);
  }

  get sortedPlayers() {
    return this.players.sort(p => (p.username === this.currentUser ? -1 : 1));
  }
}

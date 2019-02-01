import { Component, OnInit, Input } from '@angular/core';
import { IGame } from '../game-lobby.component';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  @Input() game: IGame;
  public rounds: number[] = [];

  constructor() {}

  ngOnInit() {
    this.rounds = new Array(this.game.roundNumber || 0)
      .fill(null)
      .map((_, i) => i + 1);
  }

  get finalRound() {
    return this.game.status === 'complete' ? this.game.roundNumber : undefined;
  }
}

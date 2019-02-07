import { IScore } from './scores-table/scores-table.component';
import { IPlayer } from './../game-lobby.component';
import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { IGame } from '../game-lobby.component';

@Component({
  selector: 'app-scores-list',
  templateUrl: './scores-list.component.html',
  styleUrls: ['./scores-list.component.scss'],
})
export class ScoresListComponent implements OnInit, OnChanges {
  @Input() scores: IScore[];
  @Input() currentUser: string;
  @Input() game: IGame;
  @Input() inGame: boolean;
  @Input() players: IPlayer[];

  public playersNoScore: string[] = [];

  constructor() {}

  ngOnInit() {}

  ngOnChanges() {
    this.playersNoScore = this.players
      .filter(
        p =>
          p.roundLostOn === this.game.roundNumber &&
          !this.scores.some(s => s.username === p.username),
      )
      .map(p => p.username);
  }

  get myScore() {
    return this.scores.find(s => s.username === this.currentUser);
  }
}

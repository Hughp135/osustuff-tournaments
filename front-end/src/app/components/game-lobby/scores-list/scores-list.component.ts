import { Component, OnInit, Input } from '@angular/core';
import { getAppliedMods } from '../../../helpers/get-applied-mods';
import { IGame } from '../game-lobby.component';

@Component({
  selector: 'app-scores-list',
  templateUrl: './scores-list.component.html',
  styleUrls: ['./scores-list.component.scss'],
})
export class ScoresListComponent implements OnInit {
  @Input() scores;
  @Input() players;
  @Input() currentUser: string;
  @Input() game: IGame;

  constructor() {}

  ngOnInit() {}

  get myScore() {
    return this.scores.find(s => s.username === this.currentUser);
  }
}

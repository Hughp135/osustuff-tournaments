import { Component, OnInit, Input } from '@angular/core';
import { getAppliedMods } from 'src/app/helpers/get-applied-mods';
import { IGame } from '../../game-lobby.component';

@Component({
  selector: 'app-scores-table',
  templateUrl: './scores-table.component.html',
  styleUrls: ['./scores-table.component.scss']
})
export class ScoresTableComponent implements OnInit {
  @Input() scores;
  @Input() currentUser;
  @Input() players;
  @Input() game: IGame;

  constructor() {}

  ngOnInit() {}

  public scorePassed(score: any) {
    const player = this.players.find(p => p.username === score.username);
    if (this.game.status !== 'round-over') {
      return;
    }

    if (player && player.alive) {
      return 'alive';
    } else {
      return 'dead';
    }
  }

  public getModString(mods: number) {
    return getAppliedMods(mods).join(', ');
  }
}

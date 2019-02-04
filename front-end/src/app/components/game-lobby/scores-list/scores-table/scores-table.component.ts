import { Component, OnInit, Input } from '@angular/core';
import { getAppliedMods } from 'src/app/helpers/get-applied-mods';
import { IGame } from '../../game-lobby.component';

@Component({
  selector: 'app-scores-table',
  templateUrl: './scores-table.component.html',
  styleUrls: ['./scores-table.component.scss'],
})
export class ScoresTableComponent implements OnInit {
  @Input() scores;
  @Input() currentUser?;
  @Input() game: IGame;

  constructor() {}

  ngOnInit() {}

  public scoreClass(score: any) {
    return score.passedRound ? 'alive' : 'dead';
  }

  public getModString(mods: number) {
    return getAppliedMods(mods).join(', ');
  }

  public getRank(rank: string) {
    switch (rank) {
      case 'XH':
        return 'SS';
      case 'SH':
        return 'S';
      default:
        return rank;
    }
  }
}

import { Component, OnInit, Input } from '@angular/core';
import { getAppliedMods } from 'src/app/helpers/get-applied-mods';
import { IGame } from '../../game-lobby.component';

export interface IScore {
  roundId: string;
  userId: string;
  gameId: string;
  username: string;
  score: number;
  rank: string;
  mods: number;
  misses: number;
  maxCombo: number;
  accuracy: number;
  date: Date;
  count100: number;
  passedRound?: boolean;
  place: number;
  isDraw?: boolean;
}

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

  public get scoresTransformed() {
    return this.scores.map((score, index) => {
      const next = this.scores[index + 1];
      if (score.place !== undefined && next && next.place === score.place) {
        score.isDraw = true;
        next.isDraw = true;
      }
      return score;
    });
  }

  public scoreClass(score: any) {
    return score.passedRound === undefined ? '' : score.passedRound === true ? 'alive' : 'dead';
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

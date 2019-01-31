import { IGame } from './../game-lobby.component';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-game-status',
  templateUrl: './game-status.component.html',
  styleUrls: ['./game-status.component.scss']
})
export class GameStatusComponent implements OnInit {
  @Input() game: IGame;

  constructor() {}

  ngOnInit() {}

  private getTitleAndMessage(): { title: string; message: string } {
    if (this.game.status === 'new') {
      if (this.game.nextStageStarts) {
        return {
          title: 'Game is starting',
          message: 'The game is about to start! Get ready to play.'
        };
      }
      return {
        title: 'Waiting for players',
        message: 'More players are needed before the game automatically starts.'
      };
    }
    if (this.game.status === 'in-progress') {
      return {
        title: `Round ${this.game.roundNumber} has started`,
        message: `All players must now set a score on the map. Make sure you play the correct difficulty!`
      };
    }
    if (this.game.status === 'checking-scores') {
      return {
        title: `Checking scores...`,
        message:
          'All players scores are now being checked and the top players will progress to the next round shortly.'
      };
    }
    if (this.game.status === 'round-over') {
      return {
        title: `Round ${this.game.roundNumber} has finished`,
        message:
          'The next round will start shortly. Not all players have passed the round. Get ready to play again soon!'
      };
    }
    if ((this.game.status = 'complete')) {
      return {
        title: 'The game has finished!',
        message: this.game.winningUser
          ? `${this.game.winningUser.username} has won the game`
          : 'No one won this time. All players have either quit or failed to set a score in time.'
      };
    }
  }

  get title() {
    return this.getTitleAndMessage().title;
  }

  get message() {
    return this.getTitleAndMessage().message;
  }
}

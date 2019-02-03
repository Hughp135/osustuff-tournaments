import { IGame, IPlayer } from './../game-lobby.component';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-game-status',
  templateUrl: './game-status.component.html',
  styleUrls: ['./game-status.component.scss']
})
export class GameStatusComponent implements OnInit {
  @Input() game: IGame;
  @Input() inGame: boolean;
  @Input() isAlive: boolean;
  @Input() mePlayer: IPlayer;
  @Input() totalPlayers: number;
  @Input() timeLeft: string;

  constructor() {}

  ngOnInit() {}

  private getTitleAndMessage(): { title: string; message: string } {
    if (this.game.status === 'new') {
      if (this.game.nextStageStarts) {
        return {
          title: 'Game is starting soon',
          message: `The game is starting in ${this.timeLeft}`
        };
      }
      return {
        title: 'Waiting for players',
        message: 'More players are needed before the game automatically starts.'
      };
    }
    if (this.game.status === 'in-progress') {
      return {
        title: `Round ${this.game.roundNumber} is now in progress!`,
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
        message: `The next round starts in ${this.timeLeft}`
      };
    }
    if ((this.game.status = 'complete')) {
      return {
        title: 'The game has finished!',
        message: this.game.winningUser
          ? `${this.game.winningUser.username} has won the match!`
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

  get rank() {
    return this.mePlayer && this.mePlayer.gameRank;
  }

  get isWinner() {
    return this.game.winningUser && this.mePlayer &&  this.game.winningUser.username === this.mePlayer.username;
  }
}

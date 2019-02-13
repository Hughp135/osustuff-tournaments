import { IGame, IPlayer } from './../game-lobby.component';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-game-status',
  templateUrl: './game-status.component.html',
  styleUrls: ['./game-status.component.scss'],
})
export class GameStatusComponent implements OnInit {
  @Input() game: IGame;
  @Input() isAlive: boolean;
  @Input() mePlayer: IPlayer;
  @Input() totalPlayers: number;
  @Input() timeLeft: string;
  @Input() toggleViewResults: () => void;
  @Input() viewingRoundResults: boolean;

  constructor() {}

  ngOnInit() {}

  private getTitleAndMessage(): { title: string; message: string } {
    if (this.game.status === 'scheduled') {
      return {
        title: 'Game is scheduled to start later',
        message: 'The game will be open to join in ' + this.timeLeft,
      };
    }
    if (this.game.status === 'new') {
      if (this.game.nextStageStarts) {
        return {
          title: 'Game is starting soon',
          message: `The game is starting in ${this.timeLeft}${
            this.game.minRank
              ? `
This lobby is for rank ${this.game.minRank /
                  1000}k and above players. You will still gain and lose rating, but at a lower rate compared to normal lobbies` // tslint:disable-line
              : ''
          }`,
        };
      }
      return {
        title: 'Waiting for players',
        message:
          `More players are needed before the game automatically starts (at least 4 players).` +
          ` Have you tried inviting some friends to join?${
            this.game.minRank
              ? `
This lobby is for rank ${this.game.minRank /
                  1000}k and above players. You will still gain and lose rating, but at a lower rate compared to normal lobbies` // tslint:disable-line
              : ''
          }`,
      };
    }
    if (this.game.status === 'in-progress') {
      return {
        title: `Round ${this.game.roundNumber} is now in progress!`,
        message: `All players must now set a score on the map.`,
      };
    }
    if (this.game.status === 'checking-scores') {
      return {
        title: `Checking scores...`,
        message:
          'Scores are now being checked, and the winners/loser will be decided',
      };
    }
    if (this.game.status === 'round-over') {
      return {
        title: `Round ${this.game.roundNumber} has finished`,
        message: `The next round starts in ${this.timeLeft}`,
      };
    }
    if ((this.game.status = 'complete')) {
      return {
        title: 'The game has finished!',
        message: this.game.winningUser
          ? `${this.game.winningUser.username} has won the match!`
          : 'No one won this time. Either no one set a score in the final round or it was a draw.',
      };
    }
  }

  public toggleShowResults() {
    this.toggleViewResults();
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
    return (
      this.game.winningUser &&
      this.mePlayer &&
      this.game.winningUser.username === this.mePlayer.username
    );
  }
}

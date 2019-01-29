import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-game-lobby',
  templateUrl: './game-lobby.component.html',
  styleUrls: ['./game-lobby.component.scss']
})
export class GameLobbyComponent implements OnInit {
  public game: {
    _id: string;
    players: any[];
    currentRound: string;
    status:
      | 'new'
      | 'in-progress'
      | 'checking-scores'
      | 'round-over'
      | 'complete';
    winningUser: {
      userId: string;
      username: string;
    };
    roundNumber?: number;
    nextStageStarts?: Date;
  };
  constructor(private route: ActivatedRoute) {
  }

  ngOnInit() {
    const { data } = this.route.snapshot.data;

    this.game = data.lobby;
    console.log(this.game);
  }

  get showBeatmap() {
    return this.game.status !== 'new';
  }

  get showScores() {
    return false;
  }
}

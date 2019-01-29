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
    route.data.subscribe(({ data }) => {
      this.game = data.lobbies[0];
      console.log(this.game);
    });
  }

  ngOnInit() {}
}

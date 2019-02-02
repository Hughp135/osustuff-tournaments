import { Component, OnInit, Input } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-game-info',
  templateUrl: './game-info.component.html',
  styleUrls: ['./game-info.component.scss']
})
export class GameInfoComponent implements OnInit {
  @Input() game: any;
  @Input() timeLeft: string;

  constructor(private apiService: ApiService) {}

  ngOnInit() {}

  get status() {
    switch (this.game.status) {
      case 'new':
        return this.game.nextStageStarts
          ? 'Counting down to start...'
          : 'Waiting for more players';
      case 'in-progress':
        return `In Progress`;
      case 'checking-scores':
        return 'Checking scores';
      case 'round-over':
        return 'Round complete';
      case 'complete':
        return 'Finished';
      default:
        return this.game.status;
    }
  }

  public async skipRound() {
    await this.apiService
      .post(`lobbies/${this.game._id}/skip-round`, {})
      .toPromise();
  }

  public async toggleFreeze() {
    await this.apiService.post(`toggle-monitoring`, {}).toPromise();
  }

  get nextStageStartsMsg() {
    switch (this.game.status) {
      case 'new':
        return 'Game will start in';
      case 'in-progress':
        return `Round ${this.game.roundNumber} ends in`;
      case 'round-over':
        return `Round ${this.game.roundNumber + 1} starts in`;
    }
  }
}

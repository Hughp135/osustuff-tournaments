import { Component, OnInit, Input } from '@angular/core';
import { SettingsService } from 'src/app/services/settings.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-game-info',
  templateUrl: './game-info.component.html',
  styleUrls: ['./game-info.component.scss']
})
export class GameInfoComponent implements OnInit {
  @Input() game: any;
  @Input() timeLeft: string;
  @Input() inGame: boolean;

  constructor(private settingsService: SettingsService, private router: Router) {
  }

  ngOnInit() {}

  get status() {
    switch (this.game.status) {
      case 'new':
        return this.game.nextStageStarts
          ? 'About to start...'
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

  get nextStageStartsMsg() {
    switch (this.game.status) {
      case 'new':
        return 'Game will start in';
      case 'in-progress':
        return `Round ${this.game.roundNumber} ends in`;
      case 'checking-scores':
        return 'Checking scores';
      case 'round-over':
        return `Round ${this.game.roundNumber + 1} starts in`;
    }
  }

  public async leaveGame() {
    await this.settingsService.leaveGame(this.game._id);
    this.router.navigate(['/lobbies']);
  }
}

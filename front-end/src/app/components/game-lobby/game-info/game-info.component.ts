import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { SettingsService } from 'src/app/services/settings.service';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-game-info',
  templateUrl: './game-info.component.html',
  styleUrls: ['./game-info.component.scss']
})
export class GameInfoComponent implements OnInit, OnDestroy {
  @Input() game: any;
  @Input() timeLeft: string;
  @Input() inGame: boolean;

  public connectionLost: boolean;
  private subscription: Subscription;

  constructor(private settingsService: SettingsService, private router: Router, private apiService: ApiService) {
  }

  ngOnInit() {
    this.subscription = this.apiService.connectionLost.subscribe(val => this.connectionLost = val);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  get status() {
    switch (this.game.status) {
      case 'scheduled':
        return 'Scheduled';
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
      case 'scheduled':
        return 'Game open to join in';
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

import { CurrentGame } from './../../../services/settings.service';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-game-info',
  templateUrl: './game-info.component.html',
  styleUrls: ['./game-info.component.scss']
})
export class GameInfoComponent implements OnInit, OnDestroy {
  @Input() game: any;
  public subscription: Subscription;
  public timeLeft: string;

  constructor() {}

  ngOnInit() {
    this.getTimeLeft();

    this.subscription = interval(1000).subscribe(() => {
      if (!this.game.secondsToNextRound) {
        return;
      }

      // Take 1 second off time left every second
      this.game.secondsToNextRound = Math.max(
        0,
        this.game.secondsToNextRound - 1
      );
      this.getTimeLeft();
    });
  }

  private getTimeLeft() {
    if (!this.game.secondsToNextRound) {
      this.timeLeft = `--:--`;
      return;
    }

    const date = new Date();
    date.setSeconds(date.getSeconds() + this.game.secondsToNextRound);
    const { seconds, minutes } = getTimeComponents(date.getTime() - Date.now());
    this.timeLeft = `${minutes}:${seconds}`;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  get status() {
    switch (this.game.status) {
      case 'new':
        return this.game.nextStageStarts
          ? 'Starting game...'
          : 'Waiting for more players';
      case 'in-progress':
        return `Round ${this.game.roundNumber} in progress`;
      case 'complete':
        return 'Game Complete';
    }
  }
}

export function getTimeComponents(t: number) {
  const seconds = Math.floor((t / 1000) % 60);
  const minutes = Math.max(0, Math.floor((t / 1000 / 60) % 60));
  const hours = Math.max(0, Math.floor((t / (1000 * 60 * 60)) % 24));
  const days = Math.max(0, Math.floor(t / (1000 * 60 * 60 * 24)));

  return {
    total: t,
    days: days.toString(),
    hours: hours.toString().padStart(2, '0'),
    minutes: minutes.toString().padStart(2, '0'),
    seconds: seconds.toString().padStart(2, '0')
  };
}

import { SettingsService } from 'src/app/services/settings.service';
import { interval, Subscription } from 'rxjs';
import { ApiService } from './../services/api.service';
import { Component, OnInit } from '@angular/core';
import { TransitionController, Transition, TransitionDirection } from 'ng2-semantic-ui';
import { startWith } from 'rxjs/operators';

interface Achievement {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent implements OnInit {
  public transitionController = new TransitionController(false);
  private subscription: Subscription;
  public achievement: Achievement;

  constructor(private apiService: ApiService, private settingsService: SettingsService) {}

  ngOnInit() {
    this.settingsService.username.subscribe(val => {
      if (val && !this.subscription) {
        this.subscription = interval(15000)
          .pipe(startWith(0))
          .subscribe(async () => {
            const achievement: Achievement | undefined = <Achievement | undefined>(
              await this.apiService.get('unread-achievements').toPromise()
            );

            this.achievement = achievement;

            if (achievement) {
              this.showNotification();
            }
          });
      } else if (!val && this.subscription) {
        this.subscription.unsubscribe();
        this.subscription = undefined;
      }
    });
  }

  private async showNotification() {
    try {
      const audio = new Audio();
      audio.src = '/assets/sounds/success.wav';
      audio.volume = 0.2;
      audio.load();
      audio.play();
    } catch (e) {
      console.error(e);
    }
    this.animate(TransitionDirection.In);
  }

  private async animate(direction: TransitionDirection) {
    console.log('animating');
    return new Promise(res => {
      const name = direction === TransitionDirection.Out ? 'fly left' : 'fly left';
      this.transitionController.animate(
        new Transition(name, 250, direction, () => {
          res();
        }),
      );
    });
  }

  public async dismissAchievement() {
    await this.animate(TransitionDirection.Out);
    this.achievement = undefined;
  }
}

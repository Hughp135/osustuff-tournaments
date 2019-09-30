import { ApiService } from './../../services/api.service';
import { Component, OnInit } from '@angular/core';
import { SettingsService } from 'src/app/services/settings.service';
import { IUser } from '../user-profile/user-profile.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-achievements',
  templateUrl: './achievements.component.html',
  styleUrls: ['./achievements.component.scss']
})
export class AchievementsComponent implements OnInit {
  public achievements: object;
  private currentUser: IUser;
  private subscriptions: Subscription[] = [];

  constructor(
    private apiService: ApiService,
    settingsService: SettingsService,
  ) {
    this.run(); // work around for not being able to use async in constructor
                // most likely not the best practice, TODO: fix?
    this.subscriptions = [
      settingsService.user.subscribe(u => (this.currentUser = u))
    ];
  }
  ngOnInit() {}

  public async run() {
    try {
      const apiAchievements = await this.apiService.get('achievements/get-all-achievements');
      this.achievements = apiAchievements;
    } catch (e) {
      console.error(e);
    }
  }

  get loggedIn() {
    return this.currentUser && this.currentUser.username;
  }
}

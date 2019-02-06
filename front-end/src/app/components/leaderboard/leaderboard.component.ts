import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { IUser } from '../user-profile/user-profile.component';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss'],
})
export class LeaderboardComponent implements OnInit {
  public users: IUser[];

  constructor(route: ActivatedRoute) {
    this.users = route.snapshot.data.data.users;
  }

  ngOnInit() {}

  public getPercent(val: number, user: any) {
    if (user.gamesPlayed === 0) {
      return 0;
    }
    return ((val / user.gamesPlayed) * 100).toFixed(0) + '%';
  }
}

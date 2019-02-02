import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss']
})
export class LeaderboardComponent implements OnInit {
  public users: any[];

  constructor(route: ActivatedRoute) {
    this.users = route.snapshot.data.data.users;
  }

  ngOnInit() {
  }

  public getWinRate(user): string {
    return (user.wins / user.gamesPlayed * 100).toFixed(1);
  }
}

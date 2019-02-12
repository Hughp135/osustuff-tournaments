import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';

export interface IUserAchievement {
  achievementId: string;
  progress: number; // A number from 0 to 1 (1 = achieved)
  read?: boolean;
}

export interface IResult {
  ratingBefore: { weighted: number };
  ratingAfter: { weighted: number };
  gamePlayers: number;
  gameEndedAt: Date;
}

export interface IUser {
  username: string;
  osuUserId: number;
  currentGame?: string;
  ppRank: number;
  countryRank: number;
  country: string;
  rating: { mu: number; sigma: number; };
  gamesPlayed: number;
  wins: number;
  achievements: IUserAchievement[];
  percentiles: {
    top10: number;
    top20: number;
    top50: number;
  };
  results: IResult[];
  averageRank?: number;
}

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent implements OnInit {
  public user: IUser;

  constructor(route: ActivatedRoute) {
    this.user = route.snapshot.data.data.user;
  }

  ngOnInit() {}

  public getRatingChange(result) {
    if (result.ratingAfter.weighted && result.ratingBefore.weighted) {
      return parseFloat((result.ratingAfter.weighted - result.ratingBefore.weighted).toFixed(1));
    }
  }
}

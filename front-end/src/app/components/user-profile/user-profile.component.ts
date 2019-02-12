import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';

export interface IUserAchievement {
  title: string;
  description: string;
  icon: string;
}

export interface IUserResult {
  gameId: string;
  place: number;
  gameEndedAt?: Date;
  ratingChange?: number;
  ratingBefore?: number;
  ratingAfter?: number;
}

export interface IUser {
  username: string;
  osuUserId: number;
  currentGame?: string;
  ppRank: number;
  countryRank: number;
  country: string;
  rating: { mu: number; sigma: number };
  gamesPlayed: number;
  wins: number;
  achievements: IUserAchievement[];
  results: IUserResult[];
  percentiles: {
    top10: number;
    top20: number;
    top50: number;
  };
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
      return parseFloat(
        (result.ratingAfter.weighted - result.ratingBefore.weighted).toFixed(1),
      );
    }
  }
}

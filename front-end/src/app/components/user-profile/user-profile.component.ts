import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';

export interface IUserAchievement {
  title: string;
  description: string;
  icon: string;
}

export interface IUserResult {
  gameId: string;
  place: number;
  gameEndedAt?: Date;
  gameEndedAtFromNow?: string;
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

    this.user.results = this.user.results.map(result => {
      result.gameEndedAtFromNow = moment(result.gameEndedAt).fromNow();
      return result;
    });
  }

  ngOnInit() {}

  formatEloGained(elo: number) {
    const roundedElo = Math.round(elo * 100) / 100;
    return isNaN(roundedElo) ? 0.0 : roundedElo;
  }
}

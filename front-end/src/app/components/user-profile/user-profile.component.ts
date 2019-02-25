import { ApiService } from './../../services/api.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { SettingsService } from '../../services/settings.service';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';

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

export type Role = 'admin' | 'creator' | 'moderator';

export interface IUser {
  _id: string;
  username: string;
  osuUserId: number;
  currentGame?: string;
  ppRank: number;
  countryRank: number;
  country: string;
  rating: { mu: number; sigma: number; weighted: number };
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
  roles: Role[];
  banned?: boolean;
  twitch?: {
    loginName: string;
  };
}

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent implements OnInit, OnDestroy {
  public user: IUser;
  private currentUser: IUser;
  private subscriptions: Subscription[] = [];

  constructor(
    route: ActivatedRoute,
    settingsService: SettingsService,
    private apiService: ApiService,
  ) {
    this.subscriptions = [
      route.data.subscribe(({ data }) => {
        this.user = data.user;
      }),
      settingsService.user.subscribe(u => (this.currentUser = u)),
    ];
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  public getRatingChange(result) {
    if (!result.ratingAfter || !result.ratingBefore) {
      return '- -';
    }

    if (result.ratingAfter.weighted && result.ratingBefore.weighted) {
      const value = parseFloat(
        (result.ratingAfter.weighted - result.ratingBefore.weighted).toFixed(1),
      );

      return value >= 0 ? `+${value}` : value;
    }
  }

  public getResultIconClass(result: IUserResult) {
    if (result.place === 1) {
      return 'yellow trophy';
    }

    if (result.gameEndedAt) {
      return 'grey flag checkered';
    }

    return 'orange eye';
  }

  public async banUser() {
    try {
      await this.apiService.post(`admin/ban-user/`, {
        osuUserId: this.user.osuUserId,
      });
      window.location.reload();
    } catch (e) {
      console.error(e);
    }
  }

  public async unlinkTwitch() {
    await this.apiService.post('user/unlink-twitch', {});
    window.location.reload();
  }

  get isMod() {
    return this.currentUser && this.currentUser.roles.includes('moderator');
  }

  get isMyProfile() {
    return (
      this.currentUser && this.user.osuUserId === this.currentUser.osuUserId
    );
  }

  get twitchVerifyHref() {
    return (
      'https://id.twitch.tv/oauth2/authorize' +
      `?client_id=${environment.twitch_client_id}` +
      `&redirect_uri=${environment.twitch_redirect_url}` +
      '&response_type=code' +
      '&force_verify=true'
    );
  }
}

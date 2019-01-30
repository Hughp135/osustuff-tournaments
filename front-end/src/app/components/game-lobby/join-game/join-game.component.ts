import { CurrentGame } from './../../../services/settings.service';
import { ApiService } from './../../../services/api.service';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { SettingsService } from 'src/app/services/settings.service';

@Component({
  selector: 'app-join-game',
  templateUrl: './join-game.component.html',
  styleUrls: ['./join-game.component.scss']
})
export class JoinGameComponent implements OnInit, OnDestroy {
  @Input() game: any;
  @Input() inAnotherGame: boolean;

  public osuUsername = '';
  public requestingJoin = false;
  public joinRequestId: string;
  public requestedAt: Date;
  public error: string;

  constructor(
    private apiService: ApiService,
    private settingsService: SettingsService
  ) {}

  ngOnInit() {}

  ngOnDestroy() {
    this.joinRequestId = undefined;
    this.requestingJoin = false;
    this.requestedAt = undefined;
  }

  get canJoin() {
    return this.game.status === 'new';
  }

  async joinGame() {
    this.requestingJoin = true;
    this.joinRequestId = undefined;
    this.error = undefined;

    try {
      const { requestId }: any = await this.apiService
        .post(`lobbies/${this.game._id}/join`, {
          username: this.osuUsername
        })
        .toPromise();
      this.requestedAt = new Date();
      this.joinRequestId = requestId;
      await this.checkVerified();
    } catch (e) {
      if (e.status === 404) {
        this.error =
          'A user was not found with the username you entered. Please ensure it is spelled correctly.';
      } else if (e.status === 400) {
        this.error = 'This game cannot be joined anymore.';
      } else {
        throw e;
      }
    }

    setTimeout(() => {
      this.requestingJoin = false;
    }, 1000);
  }

  private async checkVerified() {
    const sixtySeconds = new Date();
    sixtySeconds.setSeconds(sixtySeconds.getSeconds() - 60);

    if (!this.joinRequestId) {
      return;
    }

    if (this.requestedAt < sixtySeconds) {
      this.joinRequestId = undefined;
      return;
    }

    try {
      const { verified }: any = await this.apiService
        .post(`check-verified`, {
          requestId: this.joinRequestId
        })
        .toPromise();

      if (verified) {
        this.settingsService.setCurrentGame(this.game._id, this.joinRequestId);
      } else {
        setTimeout(() => {
          this.checkVerified();
        }, 1000);
      }
    } catch (e) {
      console.error(e);

      this.joinRequestId = undefined;
    }
  }

  public onKeyDown(e) {
    if (e.keyCode === 13 && this.osuUsername.length >= 3) {
      this.joinGame();
    }
  }
}
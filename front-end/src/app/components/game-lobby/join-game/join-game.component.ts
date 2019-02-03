import { ApiService } from './../../../services/api.service';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { SettingsService } from 'src/app/services/settings.service';

declare var responsiveVoice: any;

@Component({
  selector: 'app-join-game',
  templateUrl: './join-game.component.html',
  styleUrls: ['./join-game.component.scss'],
})
export class JoinGameComponent implements OnInit, OnDestroy {
  @Input() game: any;
  @Input() inAnotherGame: boolean;

  public osuUsername = '';
  public requestingJoin = false;
  public joinRequestId: string;
  public requestedAt: Date;
  public error: string;

  constructor(private apiService: ApiService, private settingsService: SettingsService) {
    this.osuUsername = settingsService.username.getValue();
  }

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
      const { requestId, username }: any = await this.apiService
        .post(`lobbies/${this.game._id}/join`, {
          username: this.osuUsername,
        })
        .toPromise();
      this.requestedAt = new Date();
      this.joinRequestId = requestId;
      this.settingsService.setUsername(username);
      await this.checkVerified();
    } catch (e) {
      if (e.status === 404) {
        this.error =
          'A user was not found with the username you entered. Please ensure it is spelled correctly.';
      } else if (e.status === 400) {
        this.error = 'This game cannot be joined anymore.';
      } else if (e.status === 423) {
        this.error = 'The game is now full and cannot be joined.';
      } else {
        throw e;
      }
    }

    setTimeout(() => {
      this.requestingJoin = false;
    }, 1000);
  }

  public async leaveGame() {
    const currentGame = this.settingsService.currentGame.getValue();
    if (!currentGame) {
      this.joinRequestId = undefined;
      return;
    }

    try {
      await this.apiService
        .post(`lobbies/${this.game._id}/leave`, {
          requestId: currentGame.requestId,
        })
        .toPromise();
      this.joinRequestId = undefined;
      this.settingsService.clearCurrentGame();
    } catch (e) {
      console.error(e);
    }
  }

  private async checkVerified() {
    const timeOutDate = new Date();
    timeOutDate.setSeconds(timeOutDate.getSeconds() - 65);

    if (!this.joinRequestId) {
      return;
    }

    if (this.requestedAt < timeOutDate) {
      this.joinRequestId = undefined;
      return;
    }

    try {
      const { verified }: any = await this.apiService
        .post(`check-verified`, {
          requestId: this.joinRequestId,
        })
        .toPromise();

      if (verified) {
        responsiveVoice.speak('You have joined the game.');
        this.settingsService.setCurrentGame(this.game._id, this.joinRequestId);
      } else {
        setTimeout(() => {
          this.checkVerified();
        }, 5000);
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

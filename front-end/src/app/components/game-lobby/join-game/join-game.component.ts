import { ApiService } from './../../../services/api.service';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-join-game',
  templateUrl: './join-game.component.html',
  styleUrls: ['./join-game.component.scss'],
})
export class JoinGameComponent implements OnInit {
  @Input() game: any;
  public osuUsername = '';
  public requestingJoin = false;
  public joinRequestId: string;
  public requestedAt: Date;

  constructor(private apiService: ApiService) {}

  ngOnInit() {}

  get canJoin() {
    return this.game.status === 'new';
  }

  async joinGame() {
    this.requestingJoin = true;
    this.joinRequestId = undefined;

    try {
      const { requestId }: any = await this.apiService
        .post(`lobbies/${this.game._id}/join`, {
          username: this.osuUsername,
        })
        .toPromise();
      this.requestedAt = new Date();
      this.joinRequestId = requestId;
      await this.checkVerified();
    } catch (e) {
      console.error(e);
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
          requestId: this.joinRequestId,
        })
        .toPromise();

      console.log('verified', verified);
      setTimeout(() => {
        this.checkVerified();
      }, 1000);
    } catch (e) {
      console.error(e);
      this.joinRequestId = undefined;
    }
  }
}

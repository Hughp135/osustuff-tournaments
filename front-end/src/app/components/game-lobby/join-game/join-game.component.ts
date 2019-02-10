import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from './../../../services/api.service';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { SettingsService } from 'src/app/services/settings.service';
import { environment } from 'src/environments/environment';

declare var responsiveVoice: any;

@Component({
  selector: 'app-join-game',
  templateUrl: './join-game.component.html',
  styleUrls: ['./join-game.component.scss'],
})
export class JoinGameComponent implements OnInit, OnDestroy {
  @Input() game: any;
  @Input() inAnotherGame: boolean;

  public requestingJoin = false;
  public success = false;
  public error: string;
  public loggedIn: boolean;

  constructor(
    private apiService: ApiService,
    private settingsService: SettingsService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.loggedIn = !!settingsService.username.getValue();
  }

  ngOnInit() {
    if (this.route.snapshot.queryParams.autoJoin) {
      this.joinGame();
    }
  }

  ngOnDestroy() {
    this.requestingJoin = false;
    this.success = undefined;
  }

  get canJoin() {
    return this.game.status === 'new';
  }

  get loginLink() {
    const id = environment.osu_oauth_id;
    const redirect = environment.osu_redirect_url;
    return (
      `https://osu.ppy.sh/oauth/authorize?response_type=code&client_id=${id}&redirect_uri=${redirect}&state=` +
      JSON.stringify({ gameId: this.game._id })
    );
  }

  async joinGame() {
    this.requestingJoin = true;
    this.success = false;
    this.error = undefined;

    try {
      await this.apiService.post(`lobbies/${this.game._id}/join`, {}).toPromise();
      this.success = true;
      this.settingsService.setCurrentGame(this.game._id);
      responsiveVoice.speak('You have joined the game');
    } catch (e) {
      if (e.status === 404) {
        this.error =
          'A user was not found with the username you entered. Please ensure it is spelled correctly.';
      } else if (e.status === 400) {
        this.error = 'This game cannot be joined anymore.';
      } else if (e.status === 423) {
        this.error = 'The game is now full and cannot be joined.';
      } else if (e.status === 401) {
        if (e.error && e.error.error) {
          this.error = e.error.error;
        } else {
          this.router.navigateByUrl('/login');
        }
      } else {
        throw e;
      }
      this.requestingJoin = false;
    }

    setTimeout(() => {
      this.requestingJoin = false;
    }, 1000);
  }

  public async leaveGame() {
    try {
      await this.settingsService.leaveGame(this.game._id);
    } catch (e) {
      console.error(e);
    }
  }
}

import { AdminService } from './services/admin.service';
import { SettingsService, CurrentGame } from 'src/app/services/settings.service';
import { NavigationEnd, Router } from '@angular/router';
import { Component } from '@angular/core';
import { filter } from 'rxjs/operators';
import { ApiService } from './services/api.service';
import { IUser } from './components/user-profile/user-profile.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'osu Royal Tournament';
  public showMenu;
  public url;
  public isAdmin: boolean;
  public currentGame: CurrentGame;
  public currentUser: IUser;
  public gameId: string;
  public connectionLost = false;

  constructor(
    router: Router,
    settingsService: SettingsService,
    private adminService: AdminService,
    private apiService: ApiService,
  ) {
    router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.showMenu = event.url === '/lobbies/create' || !event.url.startsWith('/lobbies/');
        this.url = event.url;
        if (event.url.startsWith('/lobbies/')) {
          const idx = event.url.indexOf('?');
          const endIdx = idx !== -1 ? event.url.indexOf('?') - '/lobbies/'.length : undefined;
          this.gameId = event.url.substr('/lobbies/'.length, endIdx);
        } else {
          this.gameId = undefined;
        }
      });
    this.isAdmin = !!settingsService.adminPw;
    settingsService.currentGame.subscribe(val => (this.currentGame = val));
    settingsService.user.subscribe(val => (this.currentUser = val));
    this.apiService.connectionLost.subscribe(val => this.connectionLost = val);
  }

  get currentUsername() {
    return this.currentUser && this.currentUser.username;
  }

  public async clearDb() {
    await this.adminService.clearDb();
  }

  public async skipRound() {
    await this.adminService.skipRound(this.gameId);
  }

  public async deleteLobby() {
    await this.adminService.deleteLobby(this.gameId);
  }

  public async toggleFreeze() {
    await this.adminService.toggleFreeze();
  }

  public async toggleAutoCreation() {
    await this.adminService.toggleAutoCreate();
  }
}

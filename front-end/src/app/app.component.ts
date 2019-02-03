import { AdminService } from './services/admin.service';
import { SettingsService, CurrentGame } from 'src/app/services/settings.service';
import { NavigationEnd, Router } from '@angular/router';
import { Component } from '@angular/core';
import { filter } from 'rxjs/operators';

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
  public currentUsername: string;

  constructor(
    router: Router,
    settingsService: SettingsService,
    private adminService: AdminService,
  ) {
    router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.showMenu = !event.url.startsWith('/lobbies/');
        this.url = event.url;
      });
    this.isAdmin = !!settingsService.adminPw;
    settingsService.currentGame.subscribe(val => this.currentGame = val );
    settingsService.username.subscribe(val => this.currentUsername = val);
  }

  public async clearDb() {
    await this.adminService.clearDb();
  }
}

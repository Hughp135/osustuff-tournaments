import { AdminService } from './services/admin.service';
import { SettingsService } from 'src/app/services/settings.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
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

  constructor(router: Router, settingsService: SettingsService, private adminService: AdminService) {
    router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.showMenu = !event.url.startsWith('/lobbies');
        this.url = event.url;
      });
    this.isAdmin = !!settingsService.adminPw;
  }


  public async clearDb() {
    await this.adminService.clearDb();
  }
}

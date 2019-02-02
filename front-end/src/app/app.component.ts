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

  constructor(router: Router) {
    router.events
      .pipe(
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe((event: NavigationEnd) => {
        this.showMenu = !event.url.startsWith('/lobbies');
        this.url = event.url;
      });
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError, Event } from '@angular/router';

@Component({
  selector: 'app-page-loader',
  templateUrl: './page-loader.component.html',
  styleUrls: ['./page-loader.component.scss'],
})
export class PageLoaderComponent implements OnInit, OnDestroy {
  public visible: boolean;
  public subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
  ) {
    this.subscriptions = [
      this.router.events.subscribe((event: Event) => {
        this.navigationInterceptor(event);
      }),
    ];
  }

  ngOnInit() { }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private navigationInterceptor(event: Event): void {
    if (event instanceof NavigationStart) {
      this.visible = true;
    }
    if (event instanceof NavigationEnd) {
      this.visible = false;
    }

    // Set loading state to false in both of the below events to hide the loader in case a request fails
    if (event instanceof NavigationCancel) {
      this.visible = false;
    }
    if (event instanceof NavigationError) {
      this.visible = false;
    }
  }
}

import { ApiService } from 'src/app/services/api.service';
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LeaderboardResolver implements Resolve<any> {
  constructor(private apiService: ApiService) {}

  async resolve(): Promise<Observable<any> | any> {
    return {
      users: await this.apiService.get('users').toPromise()
    };
  }
}

import { ApiService } from 'src/app/services/api.service';
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserProfileResolver implements Resolve<any> {
  constructor(private apiService: ApiService) {}

  async resolve(route: ActivatedRouteSnapshot): Promise<Observable<any> | any> {
    const { username } = route.params;

    return {
      user: await this.apiService.get(`user/${username}`).toPromise()
    };
  }
}

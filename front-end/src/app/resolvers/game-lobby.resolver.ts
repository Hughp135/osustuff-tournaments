import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { ApiService } from '../services/api.service';

@Injectable({
  providedIn: 'root'
})
export class GameLobbyResolver implements Resolve<any> {
  constructor(private apiService: ApiService) {}

  async resolve(
    router: ActivatedRouteSnapshot
  ): Promise<Observable<any> | any> {
    return await this.apiService.get('lobbies').toPromise();
  }
}

import { Injectable } from '@angular/core';
import { ApiService } from './services/api.service';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  constructor(private apiService: ApiService) {}

  public async getLobbies() {
    return await this.apiService.get('lobbies').toPromise();
  }
}

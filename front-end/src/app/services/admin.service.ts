import { ApiService } from './api.service';
import { Injectable } from '@angular/core';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  constructor(private apiService: ApiService, private settingsService: SettingsService) {}

  public async skipRound(gameId: string) {
    await this.apiService
      .post(`lobbies/${gameId}/skip-round`, { pw: this.settingsService.adminPw })
      .toPromise();
  }

  public async toggleFreeze() {
    await this.apiService
      .post(`toggle-monitoring`, { pw: this.settingsService.adminPw })
      .toPromise();
  }

  public async clearDb() {
    await this.apiService
      .post(`admin/clear-db`, { pw: this.settingsService.adminPw })
      .toPromise();
  }

  public async toggleAutoCreate() {
    await this.apiService
      .post(`admin/toggle-autocreate`, { pw: this.settingsService.adminPw })
      .toPromise();
  }
  public async deleteLobby(gameId: string) {
    await this.apiService
      .post(`admin/delete-lobby`, { pw: this.settingsService.adminPw, gameId })
      .toPromise();
  }
}

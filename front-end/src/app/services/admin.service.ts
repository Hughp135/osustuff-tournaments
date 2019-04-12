import { ApiService } from './api.service';
import { Injectable } from '@angular/core';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  constructor(private apiService: ApiService, private settingsService: SettingsService) {}

  public async skipRound(gameId: string) {
    await this.apiService.post(`lobbies/${gameId}/skip-round`, {
      pw: this.settingsService.adminPw,
    });
  }

  public async toggleFreeze() {
    await this.apiService.post(`toggle-monitoring`, { pw: this.settingsService.adminPw });
  }

  public async clearDb() {
    await this.apiService.post(`admin/clear-db`, { pw: this.settingsService.adminPw });
  }

  public async toggleAutoCreate() {
    await this.apiService.post(`admin/toggle-autocreate`, { pw: this.settingsService.adminPw });
  }

  public async deleteLobby(gameId: string) {
    await this.apiService.post(`admin/delete-lobby`, { gameId });
  }

  public async createTestUser() {
    await this.apiService.post(`admin/create-test-user`, { pw: this.settingsService.adminPw });
  }
}

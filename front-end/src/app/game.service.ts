import { Injectable } from '@angular/core';
import { ApiService } from './services/api.service';
import { Message } from './components/game-lobby/chat/chat.component';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  constructor(private apiService: ApiService) {}

  public async getLobbies() {
    return await this.apiService.get('lobbies').toPromise();
  }

  public async getLobby(id: string) {
    return await this.apiService.get(`lobbies/${id}`).toPromise();
  }

  public async getLobbyBeatmaps(id: string) {
    return await this.apiService.get(`lobbies/${id}/beatmaps`).toPromise();
  }

  public async getLobbyUsers(id: string) {
    return await this.apiService.get(`lobbies/${id}/users`).toPromise();
  }

  public async getLobbyMessages(id: string, afterId?: string): Promise<Message[]> {
    return <Message[]>await this.apiService
      .get(`lobbies/${id}/messages`, {
        query: afterId ? { afterId } : undefined,
      })
      .toPromise();
  }

  public async sendMessage(id: string, requestId: string, message: string) {
    return await this.apiService
      .post(`lobbies/${id}/messages`, {
        requestId,
        message,
      })
      .toPromise();
  }
}

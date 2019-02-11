import { IPlayer, IGame } from './components/game-lobby/game-lobby.component';
import { Injectable } from '@angular/core';
import { ApiService } from './services/api.service';
import { Message } from './components/game-lobby/chat/chat.component';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  constructor(private apiService: ApiService) {}

  public async getLobbies() {
    return <IGame[]> await this.apiService.get('lobbies');
  }

  public async getLobby(id: string) {
    return <IGame>await this.apiService.get(`lobbies/${id}`);
  }

  public async getLobbyBeatmaps(id: string) {
    return await this.apiService.get(`lobbies/${id}/beatmaps`);
  }

  public async getLobbyUsers(id: string): Promise<IPlayer[]> {
    return <IPlayer[]>await this.apiService.get(`lobbies/${id}/users`);
  }

  public async getLobbyRound(id: string, roundNum: number) {
    return await this.apiService.get(`lobbies/${id}/rounds/${roundNum}`);
  }

  public async getLobbyMessages(id: string, afterId?: string): Promise<Message[]> {
    return <Message[]>await this.apiService
      .get(`lobbies/${id}/messages`, {
        query: afterId ? { afterId } : undefined,
      })
      ;
  }

  public async sendMessage(id: string, message: string) {
    return await this.apiService
      .post(`lobbies/${id}/messages`, {
        message,
      })
      ;
  }
}

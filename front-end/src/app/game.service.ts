import { IPlayer, IGame } from './components/game-lobby/game-lobby.component';
import { Injectable } from '@angular/core';
import { ApiService } from './services/api.service';
import { Message } from './components/game-lobby/chat/chat.component';
import { BehaviorSubject } from 'rxjs';
import { IBeatmap } from './components/create-lobby/create-lobby.component';

export interface ICreateScheduledGameOptions {
  title: string;
  roundBeatmaps: Array<IBeatmap | undefined>;
  nextStageStarts: Date;
  minPlayers: number;
  maxPlayers: number;
  minRank?: number;
  maxRank?: number;
  description?: string;
}

@Injectable({
  providedIn: 'root',
})
export class GameService {
  constructor(private apiService: ApiService) {}

  public async getLobbies() {
    return <IGame[]>await this.apiService.get('lobbies');
  }

  public async getLobby(id: string) {
    return <IGame>await this.apiService.get(`lobbies/${id}`);
  }

  public async getLobbyBeatmaps(id: string): Promise<IBeatmap[]> {
    return <IBeatmap[]> await this.apiService.get(`lobbies/${id}/beatmaps`);
  }

  public async getLobbyUsers(id: string): Promise<IPlayer[]> {
    return <IPlayer[]>await this.apiService.get(`lobbies/${id}/users`);
  }

  public async getLobbyRound(id: string, roundNum: number) {
    return await this.apiService.get(`lobbies/${id}/rounds/${roundNum}`);
  }

  public async getLobbyMessages(
    id: string,
    afterId?: string,
  ): Promise<Message[]> {
    return <Message[]>await this.apiService.get(`lobbies/${id}/messages`, {
      query: afterId ? { afterId } : undefined,
    });
  }

  public async sendMessage(id: string, message: string) {
    return await this.apiService.post(`lobbies/${id}/messages`, {
      message,
    });
  }

  public async kickUser(gameId: string, playerId: string) {
    return await this.apiService.post(`lobbies/${gameId}/players/${playerId}/kick`, {});
  }

  public async createScheduledGame(
    options: ICreateScheduledGameOptions,
  ): Promise<{ gameId: string }> {
    return <{ gameId: string }>(
      await this.apiService.post(`lobbies/schedule-game`, options)
    );
  }

  public async editGame(
    gameId: string,
    options: ICreateScheduledGameOptions,
  ): Promise<{ gameId: string }> {
    return <{ gameId: string }>(
      await this.apiService.put(`lobbies/${gameId}`, options)
    );
  }
}

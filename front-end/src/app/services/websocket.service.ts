import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { environment } from '../../environments/environment';
import { SettingsService } from './settings.service';
import { BehaviorSubject } from 'rxjs';
import { IGame, IPlayer } from '../components/game-lobby/game-lobby.component';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  public socket: any;
  public connected = false;
  public reconnecting = false;
  public lobby = new BehaviorSubject<IGame>(undefined);
  public players = new BehaviorSubject<{ players: IPlayer[]; gameId: string }>(
    undefined,
  );

  constructor() {}

  public async connect(gameId: string) {
    if (this.socket && this.socket.connected) {
      console.log('already connected');
      return;
    }
    this.socket = io.connect(environment.socket_url);
    await this.addSocketListeners(gameId);
  }

  private async addSocketListeners(gameId: string) {
    return new Promise((res, rej) => {
      this.socket.on('connect', async (data: Object) => {
        console.log('connect1');
        if (this.reconnecting) {
          console.log('reconnected');
        }
        this.socket.emit('join-game', gameId);
        this.connected = true;
        this.reconnecting = false;
        res();
      });
      this.socket.on('disconnect', (reason: string) => {
        console.log('disconnected');
        // SOCKET CONNECTION LOST
        console.error(reason);
        this.connected = false;
        this.reconnecting = true;
        rej(reason);
      });
      this.socket.on('error', (data: Object) => {
        /* istanbul ignore next  */
        if (
          data === 'No token provided' ||
          data === 'Invalid token' ||
          data === 'User not found'
        ) {
          rej('unauthenticated');
        }
        console.error(data);
      });
      this.socket.on('game-updated', (game: any) => {
        console.log('game Updated', game);
        this.lobby.next(game);
      });
      this.socket.on('players-updated', ({ players, gameId: id }: any) => {
        console.log('players Updated', players);
        this.players.next({players, gameId});
      });
    });
  }
}

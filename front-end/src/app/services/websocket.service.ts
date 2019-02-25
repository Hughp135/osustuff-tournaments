import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  public socket: any;
  public connected = false;
  public reconnecting = false;

  constructor() { }

  public connect(gameId: string) {
    if (this.socket && this.socket.connected) {
      console.log('already connected');
      return;
    }
    this.socket = io.connect(environment.socket_url);
    this.addSocketListeners(gameId);
  }

  private addSocketListeners(gameId: string) {
    this.socket.on('connect', async (data: Object) => {
      if (this.reconnecting) {
        console.log('reconnecting');
      }
      this.connected = true;
      this.reconnecting = false;
      this.socket.emit('join-game', gameId);
    });
    this.socket.on('disconnect', (reason: string) => {
      console.log('disconnected');
      // SOCKET CONNECTION LOST
      console.error(reason);
      this.connected = false;
      this.reconnecting = true;
    });
    this.socket.on('error', (data: Object) => {
      /* istanbul ignore next  */
      if (data === 'No token provided' || data === 'Invalid token' || data === 'User not found') {
      }
      console.error(data);
    });
  }
}

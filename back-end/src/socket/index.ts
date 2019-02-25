import socketIo, { Server } from 'socket.io';
import { socketAuth, ISocket } from './auth/socket-auth';
import http from 'http';
import express from 'express';
import config from 'config';
import { connectToMongo } from '../helpers/connect-to-mongo';
import { sendMessage } from './messages/new-message';
import { joinLobby } from './game/join';
import { gameUpdated } from './game/updated';

export let io: Server;
const app = express();
const server = http.createServer(app);
const SOCKET_PORT = config.get('SOCKET_PORT');

export async function startWs() {
  await connectToMongo();

  if (process.env.MODE === 'api') {
    throw new Error('Attempted to start socket server in API process');
  }

  io = socketIo(server);
  io.use(socketAuth(io));
  io.on('connection', async (socket: ISocket) => {
    console.info(
      'info',
      `User connected: ${socket.id}, ${socket.claim.username} ${
        socket.claim.user_id
      }`,
    );
  });
  (<any>io).setMaxListeners(50);

  // Add event listeners (endpoints)
  sendMessage(io);
  joinLobby(io);

  gameUpdated(app, io);

  await server.listen(SOCKET_PORT);

  console.info('Socket server started on port ' + SOCKET_PORT);
}

startWs().catch(e => console.error(e));

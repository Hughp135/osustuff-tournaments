import socketIo, { Server } from 'socket.io';
import { socketAuth, ISocket } from './auth/socket-auth';
import http from 'http';
import express from 'express';
import config from 'config';
import cookieParser from 'cookie-parser';
import { connectToMongo } from '../helpers/connect-to-mongo';
import { sendMessage } from './messages/new-message';
import { joinLobby } from './game/join';
import { gameUpdated } from './game/game-updated-emit';
import bodyParser from 'body-parser';
import { playersUpdated } from './game/players-emit';
import { systemMessage } from './messages/message-emit';

export let io: Server;

export async function startWs() {
  if (process.env.MODE === 'api') {
    throw new Error('Attempted to start socket server in API process');
  }

  // Set up the API for game updates
  const app = express();
  app.use(bodyParser.json({ limit: '2mb' }));
  app.use(cookieParser());
  app.use((req, res, next) => {
    console.log(req.url);
    const ip = req.connection.remoteAddress;
    const isLocal =
      ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';

    if (!isLocal) {
      console.error(
        'socket api called from non-localhost address',
        req.connection.remoteAddress,
        (<any>req).claim,
      );
      return res.status(401).end();
    }

    next();
  });

  const server = http.createServer(app);
  const SOCKET_PORT = config.get('SOCKET_PORT');

  await connectToMongo();

  io = socketIo(server);
  io.use(socketAuth(io));
  io.on('connection', async (socket: ISocket) => {
    console.info(
      'info',
      `User connected: ${socket.id}, claim: ${socket.claim &&
        `${socket.claim.username} ${socket.claim.user_id}`}`,
    );
  });
  (<any>io).setMaxListeners(50);

  // Add event listeners (endpoints)
  sendMessage(io);
  joinLobby(io);

  gameUpdated(app, io);
  playersUpdated(app, io);
  systemMessage(app, io);

  await server.listen(SOCKET_PORT);

  console.info('Socket server started on port ' + SOCKET_PORT);
}

startWs().catch(e => console.error(e));

import { IMessage } from './../../models/Message.model';
import { Express } from 'express';
import { Server } from 'socket.io';
import { logger } from '../../logger';

export function systemMessage(app: Express, io: Server) {
  app.post('/system-message', async (req, res) => {
    const { message }: {message: IMessage} = req.body || {};

    if (message) {
      io.in(`lobby-${message.gameId}`).emit('chat-message', message);
    } else {
      logger.error('No message received in system message!', req.body);
    }

    res.status(200).end();
  });
}

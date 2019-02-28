import { Express } from 'express';
import { Server } from 'socket.io';
import { logger } from '../../logger';

export function playersUpdated(app: Express, io: Server) {
  app.post('/players-updated', async (req, res) => {
    const { players, gameId }: any = req.body || {};

    if (gameId) {
      io.in(`lobby-${gameId}`).emit('players-updated', { players, gameId });
    } else {
      logger.error('No game id received in players update!', req.body);
    }

    res.status(200).end();
  });
}

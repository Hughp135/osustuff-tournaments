import { Express } from 'express';
import { Server } from 'socket.io';
import { getGamePayload } from '../../api/lobbies/get';
import { logger } from '../../logger';

export function gameUpdated(app: Express, io: Server) {
  app.post('/game-updated', async (req, res) => {
    const { gameId }: { gameId: string } = req.body || {};

    if (gameId) {
      const payload = await getGamePayload(gameId);
      logger.info(`(game id: ${gameId}) Emitting update payload.`);
      io.in(`lobby-${gameId}`).emit('game-updated', payload);
    } else {
      logger.error('No game id received in game update!', req.body);
    }

    res.status(200).end();
  });
}

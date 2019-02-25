import { Express } from 'express';
import { Server } from 'socket.io';
import { getGamePayload } from '../../api/lobbies/get';

export function gameUpdated(app: Express, io: Server) {
  app.post('/game-updated', async (req, res) => {
    const { gameId }: { gameId: string } = req.body || {};
    console.log('game updated', `lobby-${gameId}`);

    if (gameId) {
      const payload = await getGamePayload(gameId);
      console.log('emitting payload');
      io.in(`lobby-${gameId}`).emit('game-updated', payload);
    } else {
      console.error('gameUpdated() gameId not set', req.body);
    }

    res.status(200).end();
  });
}

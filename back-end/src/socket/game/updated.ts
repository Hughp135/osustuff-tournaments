import { Express } from 'express';
import { Server } from 'socket.io';
import { getGamePayload } from '../../api/lobbies/get';

export function gameUpdated(app: Express, io: Server) {
  app.post('/game-updated', async (req, res) => {
    const { gameId }: { gameId: string } = req.body || {};
    const ip = req.connection.remoteAddress;
    const isLocal = ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';

    if (!isLocal) {
      console.error(
        'game-update called from non-localhost address',
        req.connection.remoteAddress,
        (<any>req).claim,
      );
      return res.status(401).end();
    }

    if (gameId) {
      const payload = await getGamePayload(gameId);
      console.log('emitting payload', payload);
      io.in(`lobby-${gameId}`).emit('game-updated', payload);
    } else {
      console.error('gameUpdated() gameId not set');
    }

    res.status(200).end();
  });
}

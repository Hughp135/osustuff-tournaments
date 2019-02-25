import { Express } from 'express';
import { Server } from 'socket.io';

export function playersUpdated(app: Express, io: Server) {
  app.post('/players-updated', async (req, res) => {
    const { players, gameId }: any = req.body || {};
    console.log('players updated', `lobby-${gameId}`);

    if (gameId) {
      io.in(`lobby-${gameId}`).emit('players-updated', { players, gameId });
    } else {
      console.error('gameUpdated() gameId not set', req.body);
    }

    res.status(200).end();
  });
}

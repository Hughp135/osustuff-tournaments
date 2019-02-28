import got from 'got';
import { IGame } from '../models/Game.model';
import config from 'config';

export async function sendGameToSocket(game: IGame) {
  try {
    await got.post(
      `http://localhost:${config.get('SOCKET_PORT')}/game-updated`,
      {
        json: true,
        body: {
          gameId: game._id,
        },
      },
    );
  } catch (e) {
    console.info('failed to post to update game', e.status, e.body);
  }
}

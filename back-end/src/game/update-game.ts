import got from 'got';
import { IGame } from '../models/Game.model';
import config from 'config';
import { logger } from '../logger';

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
    logger.error(`(game id: ${game._id}) Failed to post game update!`, e);
  }
}

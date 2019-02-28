import { IGame } from './../../models/Game.model';
import got from 'got';
import { getGamePlayers } from '../../api/lobbies/get-users';
import config from 'config';
import { logger } from '../../logger';

export const sendPlayersToSocket = async (game: IGame) => {
  await sendUpdatePlayersRequest(game);
};

export const sendUpdatePlayersRequest = async (game: IGame) => {
  try {
    const players = await getGamePlayers(game);
    logger.info(`(game id: ${game._id}) Posting ${players.length} players.`);
    await got.post(
      `http://localhost:${config.get('SOCKET_PORT')}/players-updated`,
      {
        json: true,
        body: {
          players: JSON.stringify(players),
          gameId: game._id,
        },
      },
    );
  } catch (e) {
    logger.error(`(game id: ${game._id}) Failed to post players update!`, e);
  }
};

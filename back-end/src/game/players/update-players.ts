import { IGame } from './../../models/Game.model';
import got from 'got';
import { getGamePlayers } from '../../api/lobbies/get-users';
import config from 'config';

export const sendPlayersToSocket = async (game: IGame) => {
  await sendUpdatePlayersRequest(game);
};

export const sendUpdatePlayersRequest = async (game: IGame) => {
  try {
    const players = await getGamePlayers(game);
    console.info('posting players', game._id, 'players', players.length);
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
    console.info('failed to post players update', e);
  }
};

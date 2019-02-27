import { IGame } from './../../models/Game.model';
import got from 'got';
import { getGamePlayers } from '../../api/lobbies/get-users';
import config from 'config';

export async function updatePlayers(game: IGame) {
  try {
    const players = await getGamePlayers(game);
    console.log('posting players', game._id, 'players', players.length);
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
}

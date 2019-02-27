import { IGame } from './../../models/Game.model';
import got from 'got';
import { getGamePlayers } from '../../api/lobbies/get-users';
import config from 'config';
import debounce from 'lodash.debounce';

const gameDebounces: {[key: string]: (...args: any) => any} = {};

export const sendPlayersToSocket = async (game: IGame) => {
  gameDebounces[game._id.toString] = gameDebounces[game._id.toString] || debounce(
    sendData,
    5000,
    { leading: true },
  );

  await gameDebounces[game._id.toString](game);

  setTimeout(() => {
    delete gameDebounces[game._id.toString];
  }, 30000);
};

const sendData = async (game: IGame) => {
  console.log(new Date().toUTCString());
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
};

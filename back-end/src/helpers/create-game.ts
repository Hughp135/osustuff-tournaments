import { IUser } from '../models/User.model';
import { Game, IPlayer } from '../models/Game.model';

export async function createGame(winningUser?: IUser, players?: IPlayer[]) {
  return await Game.create({
    title: 'test',
    players: players || [],
    beatmaps: [],
    winningUser: winningUser === undefined ? undefined : {
      userId: winningUser._id,
      username: winningUser.username,
    },
  });
}

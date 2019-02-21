import { IUser, User } from '../models/User.model';
import { Game } from '../models/Game.model';

export async function createGame(user?: IUser) {
  return await Game.create({
    title: 'test',
    players: [],
    beatmaps: [],
    winningUser: user === undefined ? undefined : {
      userId: user._id,
      username: user.username,
    },
  });
}

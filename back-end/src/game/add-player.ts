import { IGame, IPlayer } from './../models/Game.model';
import { IUser } from '../models/User.model';
import { userToPlayer } from '../helpers/tests/user-to-player';

export async function addPlayer(game: IGame, user: IUser): Promise<IUser> {
  const player: IPlayer = userToPlayer(user);

  if (!game.players.some(p => p.userId.toString() === player.userId.toString())) {
    game.players.push(player);
    await game.save();
  }

  user.currentGame = game._id;

  await user.save();

  return user;
}

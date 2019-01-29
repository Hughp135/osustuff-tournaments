import { IGame, IPlayer } from './../models/Game.model';
import { User } from '../models/User.model';

export async function addPlayer(game: IGame, player: IPlayer) {
  const user = await User.findOne({username: player.username});

  if (!user) {
    throw new Error('User not found with username ' + player.username);
  }

  game.players = game.players.concat(player);

  await game.save();

  user.currentGame = game._id;

  await user.save();
}

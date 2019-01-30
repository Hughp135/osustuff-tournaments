import { IGame, IPlayer } from './../models/Game.model';
import { IUser } from '../models/User.model';

export async function addPlayer(game: IGame, user: IUser) {
  console.log(user);
  const player: IPlayer = {
    userId: user._id,
    alive: true,
    username: user.username,
    osuUserId: user.osuUserId,
    ppRank: user.ppRank,
    country: user.country,
  };

  game.players = game.players.concat(player);

  await game.save();

  user.currentGame = game._id;

  await user.save();
}

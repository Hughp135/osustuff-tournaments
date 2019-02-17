import { IGame, IPlayer } from './../models/Game.model';
import { IUser } from '../models/User.model';

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

export function userToPlayer(user: IUser): IPlayer {
  return {
    userId: user._id,
    alive: true,
    username: user.username,
    osuUserId: user.osuUserId,
    ppRank: user.ppRank,
    countryRank: user.countryRank,
    country: user.country,
  };
}

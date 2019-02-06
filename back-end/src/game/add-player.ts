import { IGame, IPlayer } from './../models/Game.model';
import { IUser } from '../models/User.model';

export async function addPlayer(game: IGame, user: IUser) {
  const player: IPlayer = userToPlayer(user);

  game.players = game.players.concat(player);

  await game.save();

  user.currentGame = game._id;

  await user.save();
}

export function userToPlayer(user: IUser): IPlayer {
  if (!user.elo) {
    throw new Error('user has no elo');
  }
  return {
    userId: user._id,
    elo: user.elo,
    alive: true,
    username: user.username,
    osuUserId: user.osuUserId,
    ppRank: user.ppRank,
    countryRank: user.countryRank,
    country: user.country,
  };
}

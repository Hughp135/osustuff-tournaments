import { IUser } from '../models/User.model';
import { IPlayer } from '../models/Game.model';

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

import { User } from '../models/User.model';
import { Skill } from '../services/trueskill';

interface IUserDataArguments {
  wins?: number;
  gamesPlayed?: number;
}

export async function createUser(id: number, params: IUserDataArguments) {
  const { mu, sigma } = Skill.createRating();
  return await User.create({
    wins: params.wins === undefined ? 0 : params.wins,
    gamesPlayed: params.gamesPlayed === undefined ? 0 : params.gamesPlayed,
    username: `User ${id}`,
    ppRank: id,
    countryRank: id,
    osuUserId: id,
    country: 'US',
    rating: { mu, sigma },
  });
}

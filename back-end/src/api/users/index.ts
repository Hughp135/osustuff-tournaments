import { Request, Response } from 'express';
import { User } from '../../models/User.model';

export async function getUsers(req: Request, res: Response) {
  const users = await User.find()
    .sort({ 'rating.mu': -1 })
    .select({
      rating: 1,
      username: 1,
      ppRank: 1,
      countryRank: 1,
      country: 1,
      wins: 1,
      gamesPlayed: 1,
      percentiles: 1,
    })
    .limit(400)
    .lean();

  const transformed = (<any[]> users).map((u: any) => {
    u.rating = u.rating.mu - 3 * u.rating.sigma;

    return u;
  }).sort((a, b) => b.rating - a.rating).slice(0, 100);

  res.json(transformed);
}

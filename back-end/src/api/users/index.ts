import { Request, Response } from 'express';
import { User } from '../../models/User.model';

export async function getUsers(req: Request, res: Response) {
  const users = await User.find()
    .sort({ elo: -1 })
    .select({
      updatedAt: 0,
      __v: 0,
      _id: 0,
      achievements: 0,
      createdAt: 0,
      currentGame: 0,
      results: 0,
    })
    .limit(100)
    .lean();

  res.json(users);
}

import { Request, Response } from 'express';
import { User } from '../../models/User.model';
import { getAchievement } from '../../achievements/get-achievement';
import mongoose from 'mongoose';

export async function getUser(req: Request, res: Response) {
  const { username } = req.params;

  const user = await User.findOne({ username }).select({__v: 0}).lean();

  if (!user) {
    return res.status(404).end();
  }

  user.achievements = await Promise.all(user.achievements.map(async (id: mongoose.Types.ObjectId) => {
    return await getAchievement(id);
  }));

  return res.json(user);
}

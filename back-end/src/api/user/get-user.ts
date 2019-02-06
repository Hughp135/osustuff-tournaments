import { Request, Response } from 'express';
import { User } from '../../models/User.model';
import { getAchievement } from '../../achievements/get-achievement';
import mongoose from 'mongoose';

export async function getUser(req: Request, res: Response) {
  let { username } = req.params;

  if (!username) {
    const claim = req.app.get('claim');
    if (!claim) {
      res.status(401).end();
    }
    username = req.app.get('claim').username;
  }

  const user = await User.findOne({ username }).select({ __v: 0 }).lean();

  if (!user) {
    return res.status(404).end();
  }

  user.achievements = await Promise.all(user.achievements.map(async (id: mongoose.Types.ObjectId) => {
    return await getAchievement(id);
  }));

  return res.json(user);
}

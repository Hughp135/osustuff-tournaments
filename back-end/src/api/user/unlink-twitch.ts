import { Request, Response } from 'express';
import { User } from '../../models/User.model';

export async function unlinkTwitch(req: Request, res: Response) {
  const { username }: any = (<any>req).claim || {};

  if (!username) {
    return res.status(401).json({ error: 'You must be logged in' });
  }

  const user = await User.findOne({ username }).select({ achievements: 1 });

  if (!user) {
    return res.status(401).json({ error: 'User is banned or does not exist' });
  }

  user.twitch = undefined;

  await user.save();

  res.status(200).end();
}

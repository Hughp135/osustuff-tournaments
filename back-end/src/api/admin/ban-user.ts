import { Request, Response } from 'express';
import { User } from '../../models/User.model';

export async function banUser(req: Request, res: Response) {
  const { username }: { username: string } = (<any>req).claim || {};
  const { osuUserId } = req.body;

  if (!username) {
    return res.status(401).json({ error: 'You must be logged in' });
  }

  if (!osuUserId) {
    return res.status(400).json({ error: 'osuUserId not set' });
  }

  const user = await User.findOne({ osuUserId });

  if (!user || !user.roles.includes('moderator')) {
    return res.status(401).json({ error: 'You are not allowed to do that.' });
  }

  const userToKick = await User.findOne({ osuUserId: parseInt(osuUserId, 10) });

  if (!userToKick) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (userToKick.currentGame) {
    userToKick.currentGame = undefined;
  }

  userToKick.banned = !userToKick.banned;

  await userToKick.save();

  res.status(200).end();
}

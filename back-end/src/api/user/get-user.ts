import { Request, Response } from 'express';
import { User, IUser, IUserAchievement } from '../../models/User.model';
import { getAchievement } from '../../achievements/get-achievement';
import { logger } from '../../logger';

export async function getUser(req: Request, res: Response) {
  let { username } = req.params;

  if (!username) {
    const claim = req.app.get('claim');
    if (!claim) {
      res.status(401).end();
    }
    username = req.app.get('claim').username;
  }

  const user = await User.findOne({ username })
    .select({ __v: 0 })
    .lean();

  if (!user) {
    return res.status(404).end();
  }

  user.achievements = (await Promise.all(
    user.achievements
      .filter((a: IUserAchievement) => {
        return a.progress >= 1;
      })
      .map(async ({ achievementId }: IUserAchievement) => {
        const achievement = await getAchievement(achievementId);
        if (!achievement) {
          logger.error('Achievement ID no longer exists', [
            'Achievement ID ' + achievementId.toHexString(),
            'User ID: ' + user._id.toHexString(),
          ]);
        }

        return achievement;
      }),
  )).filter((a: any) => !!a);

  return res.json(user);
}

import { Request, Response } from 'express';
import {
  User,
  IUser,
  IUserAchievement,
  IUserResult,
} from '../../models/User.model';
import { getAchievement } from '../../achievements/get-achievement';

export async function getUser(req: Request, res: Response) {
  let { username } = req.params;

  if (!username || username === 'me') {
    const claim = (<any>req).claim;
    if (!claim) {
      return res.status(401).end();
    }
    username = (<any>req).claim.username;
    if (!username) {
      return res.status(401).end();
    }
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
          const aId = achievementId.toHexString();
          const uId = user._id.toHexString();
          logger.error(`(achievement id: ${aId}, user id: ${uId}) Achievement ID no longer exists!`);
        }

        return achievement;
      }),
  )).filter((a: any) => !!a);

  user.results = user.results.reverse();

  return res.json(user);
}

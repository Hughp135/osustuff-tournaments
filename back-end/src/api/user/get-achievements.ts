import { User } from '../../models/User.model';
import { Request, Response } from 'express';
import { getAchievement } from '../../achievements/get-achievement';

export async function getUnreadAchievements(req: Request, res: Response) {
  const { username } = req.app.get('claim');

  const user = await User.findOne({ username }).select({ achievements: 1 });

  if (!user) {
    return res.status(404).end();
  }

  const firstUnread = user.achievements.find(a => a.progress >= 1 && !a.read);
  const achievement = firstUnread ? await getAchievement(firstUnread.achievementId) : null;

  if (firstUnread) {
    firstUnread.read = true;
    await user.save();
  }

  res.json(achievement);

  await user.save();
}

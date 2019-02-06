import { IUser } from '../../models/User.model';
import { getOrCreateAchievement } from '../get-or-create-achievement';

export async function achievementNewbie(allGameUsers: IUser[]) {
  const achievement = await getOrCreateAchievement(
    'Newbie',
    'Complete your first match',
    'yellow child',
  );

  await Promise.all(
    allGameUsers
      .filter(u => !u.gamesPlayed)
      .map(async user => {
        if (
          !user.achievements.some(a => a.achievementId.toString() === achievement._id.toString())
        ) {
          user.achievements.push({ achievementId: achievement._id, progress: 1 });
          await user.save();
        }
      }),
  );
}

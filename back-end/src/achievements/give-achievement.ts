import { IUser } from '../models/User.model';
import { IAchievement } from '../models/Achievement.model';

export async function giveAchievement(
  user: IUser,
  achievement: IAchievement,
) {
  const userHasAchievement = user.achievements.some(
    a => a.achievementId.toString() === achievement._id.toString(),
  );

  if (!userHasAchievement) {
    user.achievements.push({ achievementId: achievement._id, progress: 1 });
    await user.save();

    return {  user, achievement };
  }
}

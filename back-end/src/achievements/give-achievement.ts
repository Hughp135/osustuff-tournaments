import { IUserAchieved } from './update-player-achievements';
import { IUser } from '../models/User.model';
import { IAchievement } from '../models/Achievement.model';

export async function giveAchievement(
  user: IUser,
  achievement: IAchievement,
): Promise<IUserAchieved[]> {
  const userHasAchievement = user.achievements.some(
    a => a.achievementId.toString() === achievement._id.toString(),
  );

  const given: IUserAchieved[] = [];

  if (!userHasAchievement) {
    user.achievements.push({ achievementId: achievement._id, progress: 1 });
    await user.save();
    given.push({ achievement, user });
  }

  return given;
}

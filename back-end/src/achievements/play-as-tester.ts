import { IUser } from './../models/User.model';
import { getOrCreateAchievement } from './get-or-create-achievement';

export async function achievementPlayAsTester(user: IUser) {
  const achievement = await getOrCreateAchievement('Tester', 'Play a game as a tester', 'teal terminal');

  if (!user.achievements.some(a => a.toString() === achievement._id.toString())) {
    user.achievements.push(achievement._id);

    await user.save();
  }
}

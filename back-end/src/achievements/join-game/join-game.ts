import { getOrCreateAchievement } from '../get-or-create-achievement';
import { IUser } from '../../models/User.model';
import { IUserAchieved } from '../update-player-achievements';

export async function joinGame(
  users: IUser[],
): Promise<IUserAchieved[]> {
  const tester = await getOrCreateAchievement(
    'Tester',
    'Play a match as a tester',
    'teal terminal',
  );

  const achieved: IUserAchieved[] = [];

  for (const user of users) {
    achieved.push({ user, achievement: tester });
  }

  return achieved;
}

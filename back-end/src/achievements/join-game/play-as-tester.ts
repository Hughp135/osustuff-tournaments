import { getOrCreateAchievement } from '../get-or-create-achievement';
import { IUser } from '../../models/User.model';
import { giveAchievement } from '../give-achievement';

export async function achievementPlayAsTester(users: IUser[]) {
  const achievement = await getOrCreateAchievement(
    'Tester',
    'Play a game as a tester',
    'teal terminal',
  );

  await Promise.all(
    users.map(async user => {
      await giveAchievement(user, achievement);
    }),
  );
}

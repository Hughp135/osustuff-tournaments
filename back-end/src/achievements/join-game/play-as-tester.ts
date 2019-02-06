import { getOrCreateAchievement } from '../get-or-create-achievement';
import { IGame } from 'src/models/Game.model';
import { User, IUser } from 'src/models/User.model';

export async function achievementPlayAsTester(users: IUser[]) {
  const achievement = await getOrCreateAchievement(
    'Tester',
    'Play a game as a tester',
    'teal terminal',
  );

  await Promise.all(
    users.map(async user => {
      if (!user.achievements.some(a => a.achievementId.toString() === achievement._id.toString())) {
        user.achievements.push({ achievementId: achievement._id, progress: 1 });
        await user.save();
      }
    }),
  );
}

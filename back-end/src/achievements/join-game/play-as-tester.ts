import { getOrCreateAchievement } from '../get-or-create-achievement';
import { IUser } from '../../models/User.model';
import { giveAchievement } from '../give-achievement';
import { IGame } from '../../models/Game.model';

export async function achievementPlayAsTester(users: IUser[], game: IGame) {
  const achievement = await getOrCreateAchievement(
    'Tester',
    'Play a game as a tester',
    'teal terminal',
  );

  await Promise.all(
    users.map(async user => {
      await giveAchievement(user, achievement, game);
    }),
  );
}

import { getOrCreateAchievement } from '../get-or-create-achievement';
import { IUser, IUserAchievement } from '../../models/User.model';
import { giveAchievement } from '../give-achievement';
import { IGame } from '../../models/Game.model';
import config from 'config';
import { IUserAchieved } from '../update-player-achievements';

const TEST_MODE = config.get('TEST_MODE');
const VALID_ROUNDS = ['round-over'];

export async function achievementPlayAsTester(
  users: IUser[],
): Promise<IUserAchieved[]> {
  const achievement = await getOrCreateAchievement(
    'Tester',
    'Play a game as a tester',
    'teal terminal',
  );

  return users
    .filter(
      user =>
        !user.achievements.some(
          a => a.achievementId.toString() === achievement._id.toString(),
        ),
    )
    .map(user => ({ user, achievement }));
}

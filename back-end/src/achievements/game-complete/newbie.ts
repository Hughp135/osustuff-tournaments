import { IUser } from '../../models/User.model';
import { getOrCreateAchievement } from '../get-or-create-achievement';
import { IUserAchieved } from '../update-player-achievements';

export async function achievementNewbie(
  allGameUsers: IUser[],
): Promise<IUserAchieved[]> {
  const achievement1 = await getOrCreateAchievement(
    'Newbie',
    'Complete your first match',
    'yellow child',
  );
  const achievement2 = await getOrCreateAchievement(
    'Prodigy',
    'Win the first match you play',
    'pink child',
  );

  return allGameUsers
    .filter(u => u.gamesPlayed === 1)
    .map(user => {
      const achievement = user.wins === 0 ? achievement1 : achievement2;

      return { user, achievement };
    });
}

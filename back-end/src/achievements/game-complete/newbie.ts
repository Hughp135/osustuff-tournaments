import { IUserAchievement } from './../../models/User.model';
import { User } from '../../models/User.model';
import { IUser } from '../../models/User.model';
import { getOrCreateAchievement } from '../get-or-create-achievement';
import { giveAchievement } from '../give-achievement';
import { IGame } from '../../models/Game.model';

export async function achievementNewbie(allGameUsers: IUser[], game: IGame) {
  const achievement = await getOrCreateAchievement(
    'Newbie',
    'Complete your first match',
    'yellow child',
  );

  await Promise.all(
    allGameUsers
      .filter(u => u.gamesPlayed === 1)
      .map(async user => {
        await giveAchievement(user, achievement, game);
      }),
  );
}

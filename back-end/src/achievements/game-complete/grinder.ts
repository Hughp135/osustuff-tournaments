import { User } from '../../models/User.model';
import { IUser, IUserAchievement } from './../../models/User.model';
import { getOrCreateAchievement } from '../get-or-create-achievement';
import { giveAchievement } from '../give-achievement';
import { IGame } from '../../models/Game.model';

export async function achievementGrinder(users: IUser[], game: IGame) {
  const achievement5 = await getOrCreateAchievement(
    'Determined',
    'Played 5 matches in a day',
    'orange redo',
  );
  const achievement10 = await getOrCreateAchievement(
    'Hardcore Gamer',
    'Played 10 matches in a day',
    'red redo',
  );
  const date = new Date();
  date.setHours(date.getHours() - 24);

  await Promise.all(
    users.map(async user => {
      const recentResults = user.results.filter(
        r => r.gameEndedAt && r.gameEndedAt >= date,
      );
      const achievement =
        recentResults.length >= 10
          ? achievement10
          : recentResults.length >= 5
          ? achievement5
          : null;

      if (achievement) {
        await giveAchievement(user, achievement, game);
      }
    }),
  );
}

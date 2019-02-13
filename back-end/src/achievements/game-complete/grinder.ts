import { IUser } from './../../models/User.model';
import { getOrCreateAchievement } from '../get-or-create-achievement';
import { IUserAchieved } from '../update-player-achievements';

export async function achievementGrinder(
  users: IUser[],
): Promise<IUserAchieved[]> {
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

  return <IUserAchieved[]> users.map(user => {
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
      return { user, achievement };
    }
  }).filter(a => !!a); // filter undefineds out
}

import { User } from 'src/models/User.model';
import { IUser, IUserAchievement } from './../../models/User.model';
import { getOrCreateAchievement } from '../get-or-create-achievement';

export async function achievementGrinder(users: IUser[]) {
  const achievement5 = await getOrCreateAchievement(
    'Determined',
    'Played 5 games in a row',
    'orange redo',
  );
  const achievement10 = await getOrCreateAchievement(
    'Grinder',
    'Played 10 games in a row',
    'red redo',
  );
  const date = new Date();
  date.setHours(date.getHours() - 24);

  await Promise.all(
    users.map(async user => {
      const recentResults = user.results.filter(r => r.gameEndedAt >= date);
      const achievement =
        recentResults.length >= 10
          ? achievement10
          : recentResults.length >= 5
          ? achievement5
          : null;
      const hasAchievement =
        achievement &&
        user.achievements.some(
          a => a.achievementId.toString() === achievement._id.toString(),
        );

      if (achievement) {
        if (!hasAchievement) {
          const newAchievement: IUserAchievement = {
            achievementId: achievement._id,
            progress: 1,
          };
          await User.updateOne(
            { _id: user._id },
            { $addToSet: { achievements: newAchievement } },
          );
        }
      }
    }),
  );
}

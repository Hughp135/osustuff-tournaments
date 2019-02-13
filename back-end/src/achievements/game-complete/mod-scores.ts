import { IUser } from '../../models/User.model';
import { Score, IScore } from '../../models/Score.model';
import { getOrCreateAchievement } from '../get-or-create-achievement';
import { IUserAchieved } from '../update-player-achievements';

export async function achievementModScores(users: IUser[]): Promise<IUserAchieved[]> {
  const hd25 = await getOrCreateAchievement(
    'HD Adept',
    'Play 25 rounds with HD only',
    'low vision',
  );
  const hd50 = await getOrCreateAchievement(
    'HD Expert',
    'Play 50 rounds with HD only',
    'blue low vision',
  );

  const achieved: IUserAchieved[] = [];

  for (const user of users) {
    const scoreMods: Array<Partial<IScore>> = await Score.find({
      userId: user._id,
    }).select({ mods: 1 });

    const hdScores = scoreMods.filter(({ mods }) => mods === 8);

    if (hdScores.length >= 25) {
      achieved.push({
        user,
        achievement: hd25,
      });
    }
    if (hdScores.length >= 50) {
      achieved.push({
        user,
        achievement: hd50,
      });
    }
  }

  return achieved;
}

import { IUser } from '../../models/User.model';
import { Score, IScore } from '../../models/Score.model';
import { getOrCreateAchievement } from '../get-or-create-achievement';
import { IUserAchieved } from '../update-player-achievements';

export async function totalModScores(users: IUser[]): Promise<IUserAchieved[]> {
  const hd25 = await getOrCreateAchievement(
    'HD Adept',
    'Pass 25 rounds using only Hidden',
    'low vision',
  );
  const hd50 = await getOrCreateAchievement(
    'HD Expert',
    'Pass 50 rounds using only Hidden',
    'blue low vision',
  );

  const achieved: IUserAchieved[] = [];

  for (const user of users) {
    const scoreMods: Array<Partial<IScore>> = await Score.find({
      userId: user._id,
      passedRound: true,
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

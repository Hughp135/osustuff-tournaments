import { IScore } from './../../models/Score.model';
import { getOrCreateAchievement } from '../get-or-create-achievement';
import { IUser } from '../../models/User.model';

export async function passWithAnF(passedScores: IScore[], aliveUsers: IUser[]) {
  const achievement = await getOrCreateAchievement(
    'Best of the Worst',
    'Pass a round with an F rank score',
    'green times',
  );

  const fScores = passedScores.filter(s => s.rank === 'F');

  await Promise.all(
    fScores.map(async score => {
      const user = aliveUsers.find(u => u._id.toString() === score.userId.toHexString());
      if (!user) {
        return;
      }

      if (!user.achievements.some(a => a.achievementId.toString() === achievement._id.toString())) {
        user.achievements.push({ achievementId: achievement._id, progress: 1 });
        await user.save();
      }
    }),
  );
}

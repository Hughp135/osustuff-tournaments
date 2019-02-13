import { IScore } from './../../models/Score.model';
import { getOrCreateAchievement } from '../get-or-create-achievement';
import { IUser } from '../../models/User.model';
import { IUserAchieved } from '../update-player-achievements';

export async function achievementAccuracy(
  passedScores: IScore[], // referring to scores which passed the round
  aliveUsers: IUser[],
): Promise<IUserAchieved[]> {
  const achievement = await getOrCreateAchievement(
    'MingAcc',
    'Pass a round with a <60% acc non-F score',
    'purple percent',
  );

  const qualifyingScores = passedScores.filter(s => s.rank !== 'F' && s.accuracy < 60);

  return qualifyingScores
    .map(score => {
      const user = <IUser> aliveUsers.find(u => u._id.toString() === score.userId.toHexString());
      return { user, achievement };
    });
}

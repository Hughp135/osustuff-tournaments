import { IScore } from './../../models/Score.model';
import { getOrCreateAchievement } from '../get-or-create-achievement';
import { IUser } from '../../models/User.model';
import { giveAchievement } from '../give-achievement';
import { IGame } from '../../models/Game.model';
import { IUserAchieved } from '../update-player-achievements';

export async function passWithAnF(
  passedScores: IScore[], // referring to scores which passed the round
  aliveUsers: IUser[],
): Promise<IUserAchieved[]> {
  const achievement = await getOrCreateAchievement(
    'Best of the Worst',
    'Pass a round with an F rank score',
    'green times',
  );

  const fScores = passedScores.filter(s => s.rank === 'F');

  return fScores
    .map(score => {
      const user = <IUser> aliveUsers.find(u => u._id.toString() === score.userId.toHexString());
      return { user, achievement };
    });
}

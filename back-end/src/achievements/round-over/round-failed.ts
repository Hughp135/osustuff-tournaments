import { IUser } from './../../models/User.model';
import { IUserAchieved } from './../update-player-achievements';
import { IScore } from './../../models/Score.model';
import { getOrCreateAchievement } from '../get-or-create-achievement';

export async function roundFailed(
  failedScores: IScore[],
  passedScores: IScore[],
  allGameUsers: IUser[],
): Promise<IUserAchieved[]> {
  const achievement = await getOrCreateAchievement(
    'Short Straw',
    'Fail a round despite getting an S rank',
    'orange strikethrough',
  );

  const [highestScore] = passedScores.sort((a, b) => b.score - a.score);
  const fullComboScores = failedScores.filter(
    s =>
      s.rank === 'S' &&
      (highestScore ? s.maxCombo / highestScore.maxCombo >= 0.95 : true),
  );

  return fullComboScores
    .map(score => {
      const user = <IUser> allGameUsers.find(u => u._id.toString() === score.userId.toHexString());
      return { user, achievement };
    });
}

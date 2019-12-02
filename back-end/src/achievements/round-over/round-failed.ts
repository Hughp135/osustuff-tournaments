import { IUser } from './../../models/User.model';
import { IUserAchieved } from './../update-player-achievements';
import { IScore } from './../../models/Score.model';
import { getOrCreateAchievement } from '../get-or-create-achievement';

export async function roundFailed(
  allGameUsers: IUser[],
  failedScores: IScore[],
  passedScores: IScore[],
): Promise<IUserAchieved[]> {
  const shortStraw = await getOrCreateAchievement(
    'Short Straw',
    'Fail a round with a full combo',
    'orange strikethrough',
  );
  const spinToWin = await getOrCreateAchievement(
    'Spin to Win',
    'Fail a round with an SS',
    'blue sync',
  );
  const overconfident = await getOrCreateAchievement(
    'Overconfident',
    'Fail a round with Hidden, Double Time, Hard Rock, and Flashlight',
    'purple exclamation',
  );
  const pressF = await getOrCreateAchievement(
    'Press F',
    'Fail a round by less than 1000 points',
    'blue user times',
  );
  const outOfBatteries = await getOrCreateAchievement(
    'Out of Batteries',
    'Fail a round with Flashlight',
    'red battery quarter',
  );

  const achieved: IUserAchieved[] = [];

  passedScores.sort((a, b) => b.score - a.score);

  const highestScore = passedScores[0];
  const worstPassingScore = passedScores[passedScores.length - 1];

  for (const score of failedScores) {
    const user = <IUser>allGameUsers.find(u => u._id.toString() === score.userId.toHexString());

    if ((score.rank === 'SH' || score.rank === 'S') &&
      (highestScore ? score.maxCombo / highestScore.maxCombo >= 0.95 : true)) {
      achieved.push({
        user,
        achievement: shortStraw,
      });
    }

    if (score.rank === 'X' || score.rank === 'XH') {
      achieved.push({
        user,
        achievement: spinToWin,
      });
    }

    if (score.mods === 1112) { // HDDTHRFL
      achieved.push({
        user,
        achievement: overconfident,
      });
    }

    if (score.score > 0 && worstPassingScore.score - score.score <= 1000) {
      achieved.push({
        user,
        achievement: pressF,
      });
    }

    if (score.mods === 1024) {
      achieved.push({
        user,
        achievement: outOfBatteries,
      });
    }
  }

  return achieved;
}

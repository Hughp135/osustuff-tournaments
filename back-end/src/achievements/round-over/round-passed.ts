import { IScore } from '../../models/Score.model';
import { getOrCreateAchievement } from '../get-or-create-achievement';
import { getAppliedMods } from '../../helpers/get-applied-mods';
import { IUser } from '../../models/User.model';
import { IUserAchieved } from '../update-player-achievements';

export async function roundPassed(
  aliveUsers: IUser[],
  passedScores: IScore[], // referring to scores which passed the round
): Promise<IUserAchieved[]> {
  const mingAcc = await getOrCreateAchievement(
    'MingAcc',
    'Pass a round with a <60% accuracy without failing',
    'purple percent',
  );
  const bestOfTheWorst = await getOrCreateAchievement(
    'Best of the Worst',
    'Pass a round with a failed score',
    'green times',
  );
  const unconventional = await getOrCreateAchievement(
    'Unconventional',
    'Pass a round with Easy or Flashlight',
    'adjust',
  );
  const ultraInstinct = await getOrCreateAchievement(
    'Ultra Instinct',
    'Pass a round with Hard Rock and Double Time',
    'orange fire',
  );
  const ascension = await getOrCreateAchievement(
    'Ascension',
    'Pass a round with Hidden, Double Time, Hard Rock, and Flashlight',
    'yellow bolt',
  );
  const idlingIdler = await getOrCreateAchievement(
    'An Idling Idler...',
    'Pass a round without doing anything at all', // This is vague intentionally.
    'green trash',
  );
  const aCutAbove = await getOrCreateAchievement(
    'A Cut Above',
    'Get the best score in a round with No Fail and Spun Out',
    'yellow wheelchair',
  );

  const achieved: IUserAchieved[] = [];

  for (const score of passedScores) {
    const user = <IUser>aliveUsers.find(u => u._id.toString() === score.userId.toHexString());

    if (score.rank === 'F') {
      achieved.push({
        user,
        achievement: bestOfTheWorst,
      });
    } else if (score.accuracy < 60) { // Not F, but <60% accuracy
      achieved.push({
        user,
        achievement: mingAcc,
      });
    }

    const mods = getAppliedMods(score.mods);

    // TODO: Split EZFLHD into its own mod because anyone who tries that is right mad.
    if (mods.includes('EZ') || mods.includes('FL')) { // !?
      achieved.push({
        user,
        achievement: unconventional,
      });
    }

    if (mods.includes('HR') && mods.includes('DT') && !mods.includes('FL')) {
      achieved.push({
        user,
        achievement: ultraInstinct,
      });
    }

    if (mods.includes('HD') && mods.includes('DT') && mods.includes('HR') && mods.includes('FL')) { // HDDTHRFL
      achieved.push({
        user,
        achievement: ascension,
      });
    }

    if (score.score === 0) { // haha you MORON you didn't even get a single point
      achieved.push({
        user,
        achievement: idlingIdler,
      });
    }
  }

  passedScores.sort((a, b) => b.score - a.score);

  if (passedScores.length > 0) {
    const highestScore = passedScores[0];
    const highestScoreMods = getAppliedMods(highestScore.mods);
    const highestScoreUser = <IUser>aliveUsers.find(u => u._id.toString() === highestScore.userId.toHexString());

    if (highestScoreMods.includes('NF') && highestScoreMods.includes('SO')) {
      achieved.push({
        user: highestScoreUser,
        achievement: aCutAbove,
      });
    }
  }

  return achieved;
}

import { IUser } from 'src/models/User.model';
import { Score, IScore } from 'src/models/Score.model';
import { getAppliedMods } from 'src/helpers/get-applied-mods';
import { getOrCreateAchievement } from '../get-or-create-achievement';

export async function hdPlayer(users: IUser[]) {
  const achievement = await getOrCreateAchievement(
    'HD Main',
    'Play almost exclusively with HD',
    'low vision',
  );
  await Promise.all(
    users.map(async user => {
      const scoreMods: string[][] = (await Score.find({ userId: user._id })
        .select({ mods: 1 })
        .lean()).map((score: IScore) => getAppliedMods(score.mods));
      const scoresCount = scoreMods.length;
      const hdScores = scoreMods.filter(mods => mods.includes('HD'));
      console.log('scoresCount', scoresCount, 'hdScores', hdScores.length);
    }),
  );
}

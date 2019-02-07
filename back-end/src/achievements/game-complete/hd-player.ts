import { IUserAchievement } from './../../models/User.model';
import { IUser, User } from '../../models/User.model';
import { Score, IScore } from '../../models/Score.model';
import { getAppliedMods } from '../../helpers/get-applied-mods';
import { getOrCreateAchievement } from '../get-or-create-achievement';

export async function achievementHdPlayer(users: IUser[]) {
  const achievement = await getOrCreateAchievement(
    'HD Main',
    'Always picks HD',
    'low vision',
  );
  await Promise.all(
    users.map(async user => {
      const scoreMods: string[][] = (await Score.find({ userId: user._id })
        .select({ mods: 1 })
        .lean()).map((score: IScore) => getAppliedMods(score.mods));
      const scoresCount = scoreMods.length;
      const hdScores = scoreMods.filter(mods => mods.includes('HD')).length;
      if (scoresCount < 5) {
        return;
      }

      const hasAchievement = user.achievements.some(
        a => a.achievementId.toString() === achievement._id.toString(),
      );

      if (hdScores / scoresCount >= 0.9) {
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
      } else if (hasAchievement) {
        user.achievements = user.achievements.filter(
          a => a.achievementId.toHexString() !== achievement._id.toString(),
        );
        await user.save();
      }
    }),
  );
}

import { IUserAchievement } from '../../models/User.model';
import { IUser, User } from '../../models/User.model';
import { Score, IScore } from '../../models/Score.model';
import { getAppliedMods } from '../../helpers/get-applied-mods';
import { getOrCreateAchievement } from '../get-or-create-achievement';
import { Achievement } from '../../models/Achievement.model';

export async function achievementModScores(users: IUser[]) {
  const oldAchievement = await Achievement.findOne({ title: 'HD Main' });
  const achievement = await getOrCreateAchievement(
    'HD Adept',
    'Play with 25 rounds with HD only',
    'low vision',
  );
  await Promise.all(
    users.map(async user => {
      // Legacy: remove old achievement ('HD Main')
      if (
        oldAchievement &&
        user.achievements.some(a => a.achievementId.toHexString() === oldAchievement._id.toString())
      ) {
        user.achievements = user.achievements.filter(
          a => a.achievementId.toString() !== oldAchievement._id.toString(),
        );
      }
      const hasAchievement = user.achievements.some(
        a => a.achievementId.toString() === achievement._id.toString(),
      );

      if (hasAchievement) {
        return;
      }

      const scoreMods: Array<Partial<IScore>> = (await Score.find({ userId: user._id })
        .select({ mods: 1 }));
      const hdScores = scoreMods.filter(({mods}) => mods === 8);
      if (hdScores.length >= 25) {
        console.log('adding HD achievement');
        const newAchievement: IUserAchievement = {
          achievementId: achievement._id,
          progress: 1,
        };
        await User.updateOne({ _id: user._id }, { $addToSet: { achievements: newAchievement } });
      }
    }),
  );
}

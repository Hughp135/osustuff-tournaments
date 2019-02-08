import { IScore } from './../../models/Score.model';
import { IUser, IUserAchievement } from './../../models/User.model';
import { getOrCreateAchievement } from '../get-or-create-achievement';
import { getAppliedMods } from '../../helpers/get-applied-mods';

export async function achievementSpeed(users: IUser[], passedScores: IScore[]) {
  const achievement3 = await getOrCreateAchievement(
    'Speedy',
    'Pass 3 rounds in one game with DT',
    'blue forward',
  );
  const achievement5 = await getOrCreateAchievement(
    'DT God',
    'Pass 5 rounds in one game with DT',
    'red forward',
  );

  await Promise.all(
    users.map(async user => {
      const dtScores = passedScores.filter(score => {
        return getAppliedMods(score.mods).includes('DT');
      });
      const achievement = dtScores.length >= 3 && dtScores.length < 5 ? achievement3
        : dtScores.length >= 5 ? achievement5 : undefined;
      const hasAchievement = achievement && user.achievements.some(
        a => a.achievementId.toString() === achievement._id.toString(),
      );

      if (achievement && !hasAchievement) {
        const newAchievement: IUserAchievement = {
          achievementId: achievement._id,
          progress: 1,
        };
        user.achievements.push(newAchievement);
        await user.save();
      }
    }),
  );
}

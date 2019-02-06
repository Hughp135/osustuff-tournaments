import { IScore } from './../../models/Score.model';
import { IUser, IUserAchievement } from './../../models/User.model';
import { getOrCreateAchievement } from '../get-or-create-achievement';
import { getAppliedMods } from 'src/helpers/get-applied-mods';

export async function achievementSpeed(users: IUser[], passedScores: IScore[]) {
  const achievement = await getOrCreateAchievement(
    'Speedy',
    'Passed 3 rounds in one game with DT',
    'blue forward',
  );

  await Promise.all(
    users.map(async user => {
      const dtScores = passedScores.filter(score => {
        return getAppliedMods(score.mods).includes('DT');
      });
      const hasAchievement = user.achievements.some(
        a => a.achievementId.toString() === achievement._id.toString(),
      );

      if (dtScores.length >= 3 && !hasAchievement) {
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

import { IScore } from '../../models/Score.model';
import { getOrCreateAchievement } from '../get-or-create-achievement';
import { IUser } from '../../models/User.model';

export async function achievementVersatile(allUsers: IUser[], passedScores: IScore[]) {
  const achievement = await getOrCreateAchievement(
    'Versatile',
    'Pass 4 rounds with different mods',
    'yellow sliders horizontal',
  );

  const scoresPerUser = passedScores.reduce(
    // reduce to 1 score per person per round
    (acc, curr) => {
      let usr = acc.find(s => s.userId === curr.userId.toHexString());
      if (!usr) {
        usr = { userId: curr.userId.toHexString(), scores: [], uniqueMods: [] };
        acc.push(usr);
      }
      if (!usr.scores.some(s => s.roundId.toString() === curr.roundId.toString())) {
        usr.scores.push(curr);
        usr.uniqueMods = usr.uniqueMods.filter(m => m !== curr.mods).concat(curr.mods);
      }

      return acc;
    },
    <Array<{ userId: string; scores: IScore[]; uniqueMods: number[] }>> [],
  );

  const userScores = scoresPerUser.filter(u => u.uniqueMods.length >= 3);
  const userIds = userScores.map(u => u.userId.toString());
  const users = allUsers.filter(u => userIds.includes(u._id.toString()));

  await Promise.all(
    users.map(async user => {
      if (!user.achievements.some(a => a.achievementId.toString() === achievement._id.toString())) {
        user.achievements.push({ achievementId: achievement._id, progress: 1 });
        user.markModified('achievements');
        await user.save();
      }
    }),
  );
}

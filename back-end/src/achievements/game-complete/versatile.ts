import { IScore } from '../../models/Score.model';
import { getOrCreateAchievement } from '../get-or-create-achievement';
import { IUser } from '../../models/User.model';
import { giveAchievement } from '../give-achievement';
import { IGame } from '../../models/Game.model';

export async function achievementVersatile(
  allUsers: IUser[],
  passedScores: IScore[],
  game: IGame,
) {
  const achievement = await getOrCreateAchievement(
    'Versatile',
    'Pass 4 rounds with different mods',
    'yellow sliders horizontal',
  );

  const uniqueModsPerUser = passedScores
    // Filter out users who already have the achievement
    .filter(score => {
      const user = allUsers.find(u => u._id.toString() === score.userId.toHexString());
      return user && !user.achievements.some(a => a.achievementId.toHexString() === achievement._id.toString());
    })
    // Cycle through all passed scores and count unique mods used per user
    .reduce(
    (
      acc: Array<{ userId: string; uniqueMods: number[] }>,
      curr,
    ) => {
      let usr = acc.find(x => x.userId === curr.userId.toHexString());
      if (!usr) {
        // create temp user object to hold scores/unique mods
        usr = {
          userId: curr.userId.toHexString(),
          uniqueMods: <number[]>[],
        };
        acc.push(usr);
      }
      // Add to unique mods if not already added
      if (!usr.uniqueMods.includes(curr.mods)) {
        usr.uniqueMods.push(curr.mods);
      }

      return acc;
    },
    [],
  );

  const userScores = uniqueModsPerUser.filter(u => u.uniqueMods.length >= 4);
  const userIds = userScores.map(u => u.userId.toString());
  const qualifyingUsers = allUsers.filter(u =>
    userIds.includes(u._id.toString()),
  );

  await Promise.all(
    qualifyingUsers.map(async user => {
      await giveAchievement(user, achievement, game);
    }),
  );
}

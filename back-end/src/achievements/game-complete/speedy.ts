import { IScore } from './../../models/Score.model';
import { IUser } from './../../models/User.model';
import { getOrCreateAchievement } from '../get-or-create-achievement';
import { getAppliedMods } from '../../helpers/get-applied-mods';
import { giveAchievement } from '../give-achievement';
import { IGame } from '../../models/Game.model';

export async function achievementSpeed(
  users: IUser[],
  passedScores: IScore[],
  game: IGame,
) {
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
        return (
          score.userId.toHexString() === user._id.toString() &&
          getAppliedMods(score.mods).includes('DT')
        );
      });
      const achievement: any =
        dtScores.length >= 3 && dtScores.length < 5
          ? achievement3
          : dtScores.length >= 5
          ? achievement5
          : undefined;

      if (achievement) {
        await giveAchievement(user, achievement, game);
      }
    }),
  );
}

import { IScore } from './../../models/Score.model';
import { getOrCreateAchievement } from '../get-or-create-achievement';
import { IUser } from '../../models/User.model';
import { giveAchievement } from '../give-achievement';
import { IGame } from '../../models/Game.model';

export async function passWithAnF(
  passedScores: IScore[],  // referring to scores which passed the round
  aliveUsers: IUser[],
  game: IGame,
) {
  const achievement = await getOrCreateAchievement(
    'Best of the Worst',
    'Pass a round with an F rank score',
    'green times',
  );

  const fScores = passedScores.filter(s => s.rank === 'F');

  await Promise.all(
    fScores.map(async score => {
      const user = aliveUsers.find(
        u => u._id.toString() === score.userId.toHexString(),
      );
      if (!user) {
        return;
      }

      await giveAchievement(user, achievement, game);
    }),
  );
}

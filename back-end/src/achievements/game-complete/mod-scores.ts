import { IUser } from '../../models/User.model';
import { Score, IScore } from '../../models/Score.model';
import { getOrCreateAchievement } from '../get-or-create-achievement';
import { giveAchievement } from '../give-achievement';
import { IGame } from '../../models/Game.model';

export async function achievementModScores(users: IUser[], game: IGame) {
  const hd25 = await getOrCreateAchievement(
    'HD Adept',
    'Play 25 rounds with HD only',
    'low vision',
  );
  const hd50 = await getOrCreateAchievement(
    'HD Experienced',
    'Play 50 rounds with HD only',
    'low vision',
  );

  await Promise.all(
    users.map(async user => {
      const scoreMods: Array<Partial<IScore>> = await Score.find({
        userId: user._id,
      }).select({ mods: 1 });

      const hdScores = scoreMods.filter(({ mods }) => mods === 8);
      if (hdScores.length >= 25) {
        await giveAchievement(user, hd25, game);
      }
      if (hdScores.length >= 50) {
        await giveAchievement(user, hd50, game);
      }
    }),
  );
}

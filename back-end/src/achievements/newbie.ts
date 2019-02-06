import { User } from '../models/User.model';
import { IGame } from '../models/Game.model';
import { getOrCreateAchievement } from './get-or-create-achievement';

export async function achievementNewbie(game: IGame) {
  const achievement = await getOrCreateAchievement(
    'Newbie',
    'Complete your first match',
    'blue play',
  );

  const userOsuIds = game.players.map(p => p.osuUserId);
  const users = await User.find({ osuUserId: userOsuIds, gamesPlayed: 0 });

  await Promise.all(
    users
      .filter(u => !u.gamesPlayed)
      .map(async user => {
        if (
          !user.achievements.some(
            a => a.achievementId.toString() === achievement._id.toString(),
          )
        ) {
          user.achievements.push({ achievementId: achievement._id });
          await user.save();
        }
      }),
  );
}

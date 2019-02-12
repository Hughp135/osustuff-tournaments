import { IUser } from '../../models/User.model';
import { IGame } from '../../models/Game.model';
import { getOrCreateAchievement } from '../get-or-create-achievement';
import { logger } from '../../logger';
import { giveAchievement } from '../give-achievement';

export async function achievementWinAGame(game: IGame, users: IUser[]) {
  if (!game.winningUser) {
    return;
  }

  const user = users.find(
    u => u._id.toString() === game.winningUser.userId.toString(),
  );

  if (!user) {
    return logger.error('Winning user not found in achievementWinAGame()', {
      gameId: game._id,
      winningUser: game.winningUser,
    });
  }

  const achievement = await getOrCreateAchievement(
    'Winner',
    'Win a match',
    'yellow trophy',
  );

  await giveAchievement(user, achievement, game);
}

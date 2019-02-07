import { IUser } from '../../models/User.model';
import { IGame } from '../../models/Game.model';
import winston = require('winston');
import { getOrCreateAchievement } from '../get-or-create-achievement';

export async function achievementWinAGame(game: IGame, users: IUser[]) {
  if (!game.winningUser) {
    return;
  }

  const user = users.find(u => u._id.toString() === game.winningUser.userId.toString());

  if (!user) {
    return winston.error('Winning user not found in achievementWinAGame()', {
      gameId: game._id,
      winningUser: game.winningUser,
    });
  }

  const achievement = await getOrCreateAchievement('Winner', 'Win a match', 'yellow trophy');

  if (!user.achievements.some(a => a.achievementId.toString() === achievement._id.toString())) {
    user.achievements.push({ achievementId: achievement._id, progress: 1 });
    await user.save();
  }
}

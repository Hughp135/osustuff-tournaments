import { IUser } from '../../models/User.model';
import { IGame } from '../../models/Game.model';
import { getOrCreateAchievement } from '../get-or-create-achievement';
import { IUserAchieved } from '../update-player-achievements';

export async function achievementWinAGame(
  users: IUser[],
  game: IGame,
): Promise<IUserAchieved[]> {
  if (!game.winningUser) {
    return [];
  }

  const user = users.find(
    u => u._id.toString() === game.winningUser.userId.toString(),
  );

  if (!user) {
    console.error('Winning user not found in achievementWinAGame()', {
      gameId: game._id,
      winningUser: game.winningUser,
    });

    return [];
  }

  const achievement = await getOrCreateAchievement(
    'Winner',
    'Win a match',
    'yellow trophy',
  );

  return [{ user, achievement }];
}

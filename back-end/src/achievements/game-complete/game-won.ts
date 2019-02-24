import { IUser } from '../../models/User.model';
import { IGame } from '../../models/Game.model';
import { getOrCreateAchievement } from '../get-or-create-achievement';
import { IUserAchieved } from '../update-player-achievements';
import { IScore } from '../../models/Score.model';
import { logger } from '../../logger';

export async function gameWon(
  users: IUser[],
  passedScores: IScore[],
  game: IGame,
): Promise<IUserAchieved[]> {
  if (game.winningUser === undefined) {
    return [];
  }

  const user = users.find(
    u => u._id.toString() === (<any>game).winningUser.userId.toString(),
  );

  if (!user) {
    logger.error('Winning user not found in gameWon()', {
      gameId: game._id,
      winningUser: game.winningUser,
    });

    return [];
  }

  const winner = await getOrCreateAchievement(
    'Winner',
    'Win a match',
    'yellow checkered flag',
  );
  const paragon = await getOrCreateAchievement(
    'Paragon',
    'Win five matches',
    'yellow certificate',
  );
  const grandmaster = await getOrCreateAchievement(
    'Grandmaster',
    'Win 10 matches',
    'yellow shield alternate',
  );
  const olympian = await getOrCreateAchievement(
    'Olympian',
    'Win 20 matches',
    'yellow trophy',
  );
  const accGod = await getOrCreateAchievement(
    'Acc God',
    'Win a match with 100% accuracy every round',
    'blue percent',
  );

  const achieved: IUserAchieved[] = [];

  if (user.wins >= 20) {
    achieved.push({ user, achievement: olympian });
  }
  if (user.wins >= 10) {
    achieved.push({ user, achievement: grandmaster });
  }
  if (user.wins >= 5) {
    achieved.push({ user, achievement: paragon });
  }
  if (user.wins >= 1) {
    achieved.push({ user, achievement: winner });
  }

  const winnerScores = passedScores.filter(s => user._id.toString() === s.userId.toHexString());
  if (winnerScores.every(s => s.accuracy === 100)) {
    achieved.push({ user, achievement: accGod });
  }

  return achieved;
}

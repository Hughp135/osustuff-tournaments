import { achievementNewbie } from './game-complete/newbie';
import { IGame } from '../models/Game.model';
import { achievementVersatile } from './game-complete/versatile';
import { achievementPlayAsTester } from './join-game/play-as-tester';
import { User, IUser } from '../models/User.model';
import { achievementWinAGame } from './game-complete/win-a-game';
import { Score } from '../models/Score.model';
import { achievementModScores } from './game-complete/mod-scores';
import { achievementGrinder } from './game-complete/grinder';
import { achievementSpeed } from './game-complete/speedy';
import { logger } from '../logger';
import { passWithAnF } from './round-over/pass-with-f';
import { IAchievement } from '../models/Achievement.model';
import { giveAchievement } from './give-achievement';
import { sendAchievementMessages } from './send-achievement-msgs';
import { achievementAccuracy } from './round-over/accuracy';

export interface IUserAchieved {
  user: IUser;
  achievement: IAchievement;
}

export async function updatePlayerAchievements(game: IGame) {
  const userOsuIds = game.players.map(p => p.osuUserId);
  const allGameUsers = await User.find({ osuUserId: userOsuIds });
  const aliveUsers = allGameUsers.filter(u => {
    const player = game.players.find(p => p.osuUserId === u.osuUserId);
    return player && !!player.alive;
  });
  const passedScores = await Score.find({
    gameId: game._id,
    passedRound: true,
  }).sort({
    roundId: 1,
    score: -1,
    date: 1,
  });
  const passedRoundScores = passedScores.filter(
    s => s.roundId.toHexString() === game.currentRound.toHexString(),
  );

  try {
    const results: IUserAchieved[][] = [];

    switch (game.status) {
      case 'round-over':
        results.push(
          ...[
            await achievementPlayAsTester(aliveUsers),
            await passWithAnF(passedRoundScores, aliveUsers),
            await achievementVersatile(allGameUsers, passedScores),
            await achievementSpeed(allGameUsers, passedScores),
            await achievementAccuracy(passedRoundScores, aliveUsers),
          ],
        );
        break;
      case 'complete':
        results.push(
          ...[
            await achievementNewbie(allGameUsers),
            await achievementWinAGame(allGameUsers, game),
            await achievementGrinder(allGameUsers),
            await achievementModScores(allGameUsers),
          ],
        );
        break;
    }

    const achievementsGiven: IUserAchieved[] = results.reduce((acc, curr) => {
      acc.push(...curr);
      return acc;
    }, []);

    for (const { user, achievement } of achievementsGiven) {
      await giveAchievement(user, achievement);
    }

    await sendAchievementMessages(achievementsGiven, game);
  } catch (e) {
    logger.error('Failed to updated achievements', e);
  }
}

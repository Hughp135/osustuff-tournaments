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
import config from 'config';
import { roundFailed } from './round-over/round-failed';

const TEST_MODE = config.get('TEST_MODE');

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
  const allRoundScores = await Score.find({
    gameId: game._id,
  }).sort({
    roundId: 1,
    score: -1,
    date: 1,
  });
  const passedScores = allRoundScores.filter(s => s.passedRound);
  const failedScores = allRoundScores.filter(
    s =>
      !s.passedRound &&
      !passedScores.some( // Does not have a passing score
        s2 => s2.userId.toHexString() === s.userId.toHexString(),
      ),
  );
  const passedRoundScores = passedScores.filter(
    s => s.roundId.toHexString() === game.currentRound.toHexString(),
  );

  try {
    const results: IUserAchieved[][] = [];

    switch (game.status) {
      case 'round-over':
        results.push(
          ...[
            TEST_MODE ? await achievementPlayAsTester(aliveUsers) : [],
            await passWithAnF(passedRoundScores, aliveUsers),
            await achievementVersatile(allGameUsers, passedScores),
            await achievementSpeed(allGameUsers, passedScores),
            await achievementAccuracy(passedRoundScores, aliveUsers),
            await roundFailed(failedScores, passedScores, allGameUsers),
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

    const achievementsQualified: IUserAchieved[] = results.reduce(
      (acc, curr) => {
        acc.push(...curr);
        return acc;
      },
      [],
    );

    const achievementsAwarded: IUserAchieved[] = [];
    for (const { user, achievement } of achievementsQualified) {
      achievementsAwarded.push(...(await giveAchievement(user, achievement)));
    }

    await sendAchievementMessages(achievementsAwarded, game);
  } catch (e) {
    logger.error('Failed to updated achievements', e);
  }
}

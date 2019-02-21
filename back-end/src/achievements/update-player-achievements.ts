import { IGame } from '../models/Game.model';
import { modScores } from './game-complete/mod-scores';
import { joinGame } from './join-game/join-game';
import { User, IUser } from '../models/User.model';
import { gameWon } from './game-complete/game-won';
import { Score } from '../models/Score.model';
import { totalModScores } from './game-complete/total-mod-scores';
import { gameComplete } from './game-complete/game-complete';
import { roundPassed } from './round-over/round-passed';
import { IAchievement } from '../models/Achievement.model';
import { giveAchievement } from './give-achievement';
import { sendAchievementMessages } from './send-achievement-msgs';
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
  const allPassedScores = allRoundScores.filter(s => s.passedRound);
  const failedScores = allRoundScores.filter(
    s =>
      !s.passedRound &&
      !allPassedScores.some( // Does not have a passing score
        s2 => s2.userId.toHexString() === s.userId.toHexString(),
      ),
  );
  const passedRoundScores = allPassedScores.filter(
    s => s.roundId.toHexString() === game.currentRound.toHexString(),
  );

  const results: IUserAchieved[][] = [];

  switch (game.status) {
    case 'round-over':
      results.push(
        ...[
          TEST_MODE ? await joinGame(aliveUsers) : [],
          await modScores(allGameUsers, allPassedScores, game),
          await roundPassed(aliveUsers, passedRoundScores),
          await roundFailed(allGameUsers, failedScores, allPassedScores),
        ],
      );
      break;
    case 'complete':
      results.push(
        ...[
          await gameWon(allGameUsers, allPassedScores, game),
          await gameComplete(allGameUsers),
          await totalModScores(allGameUsers),
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
}

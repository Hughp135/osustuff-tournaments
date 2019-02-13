import { achievementNewbie } from './game-complete/newbie';
import { IGame } from '../models/Game.model';
import { achievementVersatile } from './game-complete/versatile';
import { achievementPlayAsTester } from './join-game/play-as-tester';
import { User } from '../models/User.model';
import { achievementWinAGame } from './game-complete/win-a-game';
import { Score } from '../models/Score.model';
import { achievementModScores } from './game-complete/mod-scores';
import { achievementGrinder } from './game-complete/grinder';
import { achievementSpeed } from './game-complete/speedy';
import { logger } from '../logger';
import config from 'config';
import { passWithAnF } from './round-over/pass-with-f';

const TEST_MODE = config.get('TEST_MODE');

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

  // console.log('Starting update achievements');
  // console.time('a');

  try {
    switch (game.status) {
      case 'round-over':
        if (TEST_MODE) {
          await achievementPlayAsTester(aliveUsers, game);
        }
        const passedRoundScores = passedScores.filter(
          s => s.roundId.toHexString() === game.currentRound.toHexString(),
        );
        await passWithAnF(passedRoundScores, aliveUsers, game);
        await achievementVersatile(allGameUsers, passedScores, game);
        await achievementSpeed(allGameUsers, passedScores, game);
        break;
      case 'complete':
        await achievementNewbie(allGameUsers, game);
        await achievementWinAGame(game, allGameUsers);
        await achievementGrinder(allGameUsers, game);
        await achievementModScores(allGameUsers, game); // Highly DB Intensive
        break;
    }
  } catch (e) {
    logger.error('Failed to updated achievements', e);
  }

  // console.log('ended achievments check');
  // console.timeEnd('a');
}

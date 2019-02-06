import { achievementNewbie } from './game-complete/newbie';
import winston from 'winston';
import { IGame } from 'src/models/Game.model';
import { achievementVersatile } from './game-complete/versatile';
import { achievementPlayAsTester } from './join-game/play-as-tester';
import { User } from 'src/models/User.model';
import { achievementWinAGame } from './game-complete/win-a-game';
import { Round } from 'src/models/Round.model';
import { Score } from 'src/models/Score.model';
import { achievementHdPlayer } from './game-complete/hd-player';
import { achievementGrinder } from './game-complete/grinder';
import { achievementSpeed } from './game-complete/speedy';

export async function updatePlayerAchievements(game: IGame) {
  const userOsuIds = game.players.map(p => p.osuUserId);
  const allGameUsers = await User.find({ osuUserId: userOsuIds });
  const aliveUsers = allGameUsers.filter(u => {
    const player = game.players.find(p => p.osuUserId === u.osuUserId);
    return player && !!player.alive;
  });

  try {
    switch (game.status) {
      case 'round-over':
        await achievementPlayAsTester(aliveUsers);
        break;
      case 'complete':
        const rounds = await Round.find({ gameId: game._id });
        const passedScores = await Score.find({
          gameId: game._id,
          passedRound: true,
        }).sort({
          roundId: 1,
          score: -1,
          date: 1,
        });

        await achievementNewbie(allGameUsers);
        await achievementVersatile(game, rounds, passedScores);
        await achievementWinAGame(game, allGameUsers);
        await achievementHdPlayer(allGameUsers);
        await achievementGrinder(allGameUsers);
        await achievementSpeed(allGameUsers, passedScores);
        break;
    }
  } catch (e) {
    winston.error('Failed to updated achievements', e);
  }
}

import { IUserResult } from './../models/User.model';
import { IGame } from '../models/Game.model';
import { updatePlayerGameStats } from './update-player-game-stats';
import { updatePlayerAchievements } from 'src/achievements/update-player-achievements';
import { User } from 'src/models/User.model';

export async function endGame(game: IGame) {
  const alivePlayers = game.players.filter(p => p.alive);

  if (alivePlayers.length > 1) {
    throw new Error('Cannot end game with more than 1 player alive: ' + game._id);
  }

  const [winner] = alivePlayers;

  if (winner) {
    // Winner has been decided
    game.winningUser = {
      userId: winner.userId,
      username: winner.username,
    };
    winner.gameRank = 1;

    const result: IUserResult = {
      gameId: game._id,
      place: 1,
      gameEndedAt: new Date(),
    };

    await User.updateOne({ _id: winner.userId }, { currentGame: undefined, $addToSet: { results: result } });
  }

  game.status = 'complete';
  game.nextStageStarts = undefined;

  await game.save();

  await updatePlayerGameStats(game);
  await updatePlayerAchievements(game);
}

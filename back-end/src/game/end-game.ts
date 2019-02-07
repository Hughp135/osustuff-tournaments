import { IUserResult } from './../models/User.model';
import { IGame } from '../models/Game.model';
import { updatePlayerGameStats } from './update-player-game-stats';
import { updatePlayerAchievements } from '../achievements/update-player-achievements';
import { User } from '../models/User.model';

export async function endGame(game: IGame) {
  const alivePlayers = game.players.filter(p => p.alive);

  await Promise.all(
    alivePlayers.map(async player => {
      player.gameRank = 1;
      const result: IUserResult = {
        gameId: game._id,
        place: 1,
        gameEndedAt: new Date(),
      };

      await User.updateOne(
        { _id: player.userId },
        { currentGame: undefined, $addToSet: { results: result } },
      );
    }),
  );

  if (alivePlayers.length === 1) {
    const [winner] = alivePlayers;

    // Winner has been decided
    game.winningUser = {
      userId: winner.userId,
      username: winner.username,
    };
  }

  game.status = 'complete';
  game.nextStageStarts = undefined;

  await game.save();

  await updatePlayerGameStats(game);
  await updatePlayerAchievements(game);
}

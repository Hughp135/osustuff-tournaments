import { IGame } from '../models/Game.model';
import { calculatePlayersElo } from './calculate-players-elo';

export async function endGame(game: IGame) {
  const alivePlayers = game.players.filter(p => p.alive);

  if (alivePlayers.length > 1) {
    throw new Error('Cannot end game with more than 1 player alive: ' + game._id);
  }

  const [winner] = alivePlayers;

  if (winner) {
    console.log('game ended, winner won', winner);
    // Winner has been decided
    game.winningUser = {
      userId: winner.userId,
      username: winner.username,
    };
    winner.gameRank = 1;
  } else {
    console.log('game ended, no one won');
    // No one won.
  }

  game.status = 'complete';
  game.nextStageStarts = undefined;

  await game.save();

  await calculatePlayersElo(game);
}

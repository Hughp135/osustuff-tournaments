import { IGame } from '../models/Game.model';
import { Score } from '../models/Score.model';
import { arrayRandVal } from '../game/create-game';

export async function addSampleScores(game: IGame) {
  await Promise.all(
    game.players
      .filter((p, index) => p.alive && (index > 5 ? Math.random() < 0.95 : true))
      .map(async player => {
        await Score.create({
          roundId: game.currentRound,
          userId: player.userId,
          username: player.username,
          score: Math.floor(Math.random() * 20000000),
          mods: arrayRandVal([0, 8, 16, 32, 64]),
          rank: arrayRandVal(['A', 'F', 'B', 'S']),
          maxCombo: Math.floor(Math.random() * 1600),
          count100: Math.floor(Math.random() * 50),
          accuracy: parseFloat((Math.random() * 100).toFixed(2)),
          misses: Math.floor(Math.random() * 50),
          date: new Date(),
        });
      }),
  );
}

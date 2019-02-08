import { IGame } from '../models/Game.model';
import { Score } from '../models/Score.model';
import { arrayRandVal } from '../game/create-game';

export async function addSampleScores(game: IGame) {
  await Promise.all(
    game.players
      .filter((p, index) => p.alive && Math.random() <= 0.95)
      .map(async (player, index) => {
        await Score.create({
          gameId: game._id,
          roundId: game.currentRound,
          userId: player.userId,
          username: player.username,
          score:
            player.username === 'Mongoose-' // bias towards my own scores LUL
              ? (Math.floor(Math.random() * 100) + 100) * 100000
              : Math.floor(Math.random() * 50) * 100000,
          mods: arrayRandVal([64]), // 80, 0, 8, 16, 32, 64, 24, 72
          rank: arrayRandVal(['A', 'F', 'B', 'S', 'XH']),
          maxCombo: Math.floor(Math.random() * 1600),
          count100: Math.floor(Math.random() * 50),
          accuracy: parseFloat((Math.random() * 100).toFixed(2)),
          misses: Math.floor(Math.random() * 50),
          date: new Date(),
        });
      }),
  );
}

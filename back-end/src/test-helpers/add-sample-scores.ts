import { IGame } from '../models/Game.model';
import { Score } from '../models/Score.model';
import { arrayRandVal } from '../game/create-game';
import { cache } from '../services/cache';
import { addOnlineUser } from '../helpers/add-online-user';

export async function addSampleScores(game: IGame) {
  await Promise.all(
    game.players
      .filter(p => p.alive && Math.random() <= 0.95)
      .map(async player => {
        cache.put(`user-active-${player.userId}`, true, 120000);
        addOnlineUser({ _id: player.userId });
        // Generate 1 or 2 scores per player
        for (let i = 0; i < Math.round(Math.random()) + 1; i++) {
          const score = Math.floor(Math.random() * 10);
          await Score.create({
            gameId: game._id,
            roundId: game.currentRound,
            userId: player.userId,
            username: player.username,
            score,
            mods: arrayRandVal([64, 72, 80, 0, 8, 16, 32, 24]),
            rank: arrayRandVal(['S']),
            maxCombo: arrayRandVal([10, 9, 7]),
            count100: Math.floor(Math.random() * 50),
            accuracy: parseFloat((Math.random() * 100).toFixed(2)),
            misses: Math.floor(Math.random() * 50),
            date: new Date(),
          });
        }
      }),
  );
}

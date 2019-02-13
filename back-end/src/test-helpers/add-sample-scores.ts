import { IGame } from '../models/Game.model';
import { Score } from '../models/Score.model';
import { arrayRandVal } from '../game/create-game';

export async function addSampleScores(game: IGame) {
  let scoresAdded = 0;
  await Promise.all(
    game.players
      .filter((p) => p.alive && Math.random() <= 0.95)
      .map(async (player) => {
        // Generate 1 or 2 scores per player
        for (let i = 0; i < Math.round(Math.random()) + 1; i++) {
          const score = player.username === 'Mongoose-' || player.osuUserId === 4787150
          ? (Math.floor(Math.random() * 100) + 100) * 100000
          : Math.floor(Math.random() * 10);
          await Score.create({
            gameId: game._id,
            roundId: game.currentRound,
            userId: player.userId,
            username: player.username,
            score,
            mods: arrayRandVal([64, 72, 80, 0, 8, 16, 32, 24]),
            rank: arrayRandVal(['A', 'F', 'X', 'S', 'SH', 'XH', 'B', 'C']),
            maxCombo: Math.floor(Math.random() * 1600),
            count100: Math.floor(Math.random() * 50),
            accuracy: parseFloat((Math.random() * 100).toFixed(2)),
            misses: Math.floor(Math.random() * 50),
            date: new Date(),
          });
          scoresAdded++;
        }
      }),
  );

}

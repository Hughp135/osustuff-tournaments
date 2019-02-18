import { IRound } from './../models/Round.model';
import { IGame, IPlayer } from './../models/Game.model';
import { Score, IScore } from '../models/Score.model';
import config from 'config';
import { addSampleScores } from '../test-helpers/add-sample-scores';
import { logger } from '../logger';
import { cache } from '../services/cache';
import { getAppliedMods } from '../helpers/get-applied-mods';

const TEST_ENV = process.env.NODE_ENV === 'test';
const TEST_MODE = config.get('TEST_MODE');

export async function checkRoundScores(
  game: IGame,
  round: IRound,
  getUserRecent: (u: string) => Promise<any>,
) {
  game.status = 'checking-scores';

  // Set the timeout date
  const date = new Date();
  date.setSeconds(date.getSeconds() + 120); // times out after 2 mins
  game.nextStageStarts = date;
  await game.save();
  cache.del(`get-lobby-${game._id}`);

  // Wait a short period of time before checking scores
  await new Promise(res =>
    setTimeout(res, TEST_ENV ? 0 : TEST_MODE ? 1000 : 5000),
  );

  if (TEST_MODE) {
    await addSampleScores(game);
  } else {
    // Wait 5 seconds before starting to check
    const players = game.players.filter(p => p.alive);

    await Promise.all(
      players.map(async p =>
        checkPlayerScores(p, round, getUserRecent).catch(e =>
          logger.error('Failed to check player scores: ' + p, e),
        ),
      ),
    );
  }
}

async function checkPlayerScores(
  player: IPlayer,
  round: IRound,
  getUserRecent: any,
) {
  const scores = await getUserRecent(player.username);
  const existingScores = await Score.find({
    roundId: round._id,
    userId: player.userId,
  });

  // Save all valid scores obtained for the round
  const promises = scores
    .filter((s: any) => scoreValidAndUnique(s, round, existingScores))
    .map(async (score: any) => {
      const count50 = parseInt(score.count50, 10);
      const count100 = parseInt(score.count100, 10);
      const count300 = parseInt(score.count300, 10);
      const misses = parseInt(score.countmiss, 10);
      const accuracy = parseFloat(
        (
          (100 * (50 * count50 + 100 * count100 + 300 * count300)) /
          (300 * (misses + count50 + count100 + count300))
        ).toFixed(2),
      );

      await Score.create({
        gameId: round.gameId,
        roundId: round._id,
        userId: player.userId,
        username: player.username,
        score: parseInt(score.score, 10),
        mods: parseInt(score.enabled_mods, 10),
        rank: score.rank,
        maxCombo: parseInt(score.maxcombo, 10),
        count100,
        accuracy,
        misses,
        date: new Date(score.date),
      });
    });

  await Promise.all(promises);
}

function scoreValidAndUnique(
  score: any,
  round: IRound,
  existingScores: IScore[],
) {
  const correctBeatmap = score.beatmap_id === round.beatmap.beatmap_id;
  const minDate = new Date(
    (<any>round).createdAt.getTime() - 10 +
      parseInt(round.beatmap.total_length, 10) / 1.5 * 1000,
  );
  const validDate = new Date(score.date) > minDate;

  if (!correctBeatmap || !validDate) {
    return false;
  }

  const scoreIsSaved = existingScores.some(
    existing => new Date(score.date).getTime() === existing.date.getTime(),
  );

  // Ensures no existing saved scores have the same date as this score
  return !scoreIsSaved;
}

import { IRound } from './../models/Round.model';
import { IGame, IPlayer } from './../models/Game.model';
import { Score, IScore } from '../models/Score.model';
import config from 'config';
import { addSampleScores } from '../test-helpers/add-sample-scores';
import { logger } from '../logger';

const TEST_MODE = config.get('TEST_MODE');
const FAST_FORWARD_MODE = config.get('FAST_FORWARD_MODE');

export async function checkRoundScores(
  game: IGame,
  round: IRound,
  getUserRecent: (u: string) => Promise<any>,
) {
  const date = new Date();
  date.setSeconds(date.getSeconds() + (FAST_FORWARD_MODE ? 1 : 120));
  game.status = 'checking-scores';
  game.nextStageStarts = date;
  await game.save();

  if (TEST_MODE) {
    await addSampleScores(game);
    await new Promise(res => setTimeout(res, 1000));
  } else {
    // Wait 5 seconds before starting to check
    await new Promise(res => setTimeout(res, 5000));
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

async function checkPlayerScores(player: IPlayer, round: IRound, getUserRecent: any) {
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

function scoreValidAndUnique(score: any, round: IRound, existingScores: IScore[]) {
  const correctBeatmap = score.beatmap_id === round.beatmap.beatmap_id;
  const correctDate = new Date(score.date) > (<any> round).createdAt;

  if (!correctBeatmap || !correctDate) {
    return false;
  }

  const scoreIsSaved = existingScores.some(
    existing => new Date(score.date).getTime() === existing.date.getTime(),
  );

  // Ensures no existing saved scores have the same date as this score
  return !scoreIsSaved;
}

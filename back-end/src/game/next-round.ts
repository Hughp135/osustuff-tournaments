import { IGame } from '../models/Game.model';
import { Round } from '../models/Round.model';
import { DURATION_ROUND_ADDITIONAL } from './durations';
import config from 'config';
import { logger } from '../logger';

const FAST_FORWARD_MODE = config.get('FAST_FORWARD_MODE');

export async function nextRound(game: IGame) {
  const nextRoundNumber = (game.roundNumber || 0) + 1;
  const beatmap = game.beatmaps[nextRoundNumber - 1];

  if (!beatmap) {
    throw new Error('No more beatmaps to go to next round with');
  }

  const round = await Round.create({
    beatmap,
    gameId: game._id,
    roundNumber: nextRoundNumber,
  });

  game.status = 'in-progress';
  game.currentRound = round._id;
  game.roundNumber = nextRoundNumber;

  logger.info(`(game id: ${game._id.toHexString()}) Starting round ${game.roundNumber}`);

  // Set time that round should last
  const date = new Date();
  date.setSeconds(
    date.getSeconds() +
      (FAST_FORWARD_MODE ? 1 : parseFloat(beatmap.total_length) + DURATION_ROUND_ADDITIONAL),
  );
  game.nextStageStarts = date;

  await game.save();
}

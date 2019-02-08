import { IGame } from '../models/Game.model';
import { Round } from '../models/Round.model';
import { DURATION_ROUND_ADDITIONAL } from './durations';
import config from 'config';

const FAST_FORWARD_MODE = config.get('FAST_FORWARD_MODE');

export async function nextRound(game: IGame) {
  const nextRoundNumber = (game.roundNumber || 0) + 1;
  const beatmap = game.beatmaps[nextRoundNumber - 1];

  if (!beatmap) {
    throw new Error('No more beatmaps to go to next round with');
  }

  const round = await Round.create({ beatmap, gameId: game._id, roundNumber: nextRoundNumber });

  game.status = 'in-progress';
  game.currentRound = round._id;
  game.roundNumber = nextRoundNumber;

  console.log('starting round', game.roundNumber, 'length', beatmap.total_length);

  // Set time that round should last
  const date = new Date();
  if (!FAST_FORWARD_MODE) {
    date.setSeconds(date.getSeconds() + parseFloat(beatmap.total_length) + DURATION_ROUND_ADDITIONAL);
  }
  game.nextStageStarts = date;

  const totalBeatmapDuration = game.beatmaps.reduce(
    (acc, curr) => acc + parseInt(curr.total_length, 10),
    0,
  );

  await game.save();
}

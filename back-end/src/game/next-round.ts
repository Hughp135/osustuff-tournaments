import { IGame } from '../models/Game.model';
import { Round } from '../models/Round.model';

export async function nextRound(game: IGame) {
  const nextRoundNumber = (game.roundNumber || 0) + 1;
  const beatmap = game.beatmaps[nextRoundNumber - 1];

  if (!beatmap) {
    throw new Error('No more beatmaps to go to next round with');
  }

  const round = await Round.create({ beatmap, gameId: game._id });

  game.status = 'in-progress';
  game.currentRound = round._id;
  game.roundNumber = nextRoundNumber;

  console.log('starting round', game.roundNumber, 'length', beatmap.total_length);

  console.log(parseFloat(beatmap.total_length));

  // Set time that round should last
  const date = new Date();
  date.setSeconds(date.getSeconds() + parseFloat(beatmap.total_length) + 0);
  game.nextStageStarts = date;

  await game.save();
}

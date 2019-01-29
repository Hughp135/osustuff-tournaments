import { IBeatmap } from '../models/Beatmap.model';
import { IGame } from '../models/Game.model';
import { Round } from '../models/Round.model';

export async function nextRound(game: IGame, beatmap: IBeatmap) {
  const round = await Round.create({ beatmap, gameId: game._id });

  game.status = 'in-progress';
  game.currentRound = round._id;
  game.roundNumber = (game.roundNumber || 0) + 1;

  console.log('starting round', game.roundNumber, 'length', beatmap.duration);

  // Set time that round should last
  const date = new Date();
  date.setSeconds(date.getSeconds() + beatmap.duration + 30);
  game.nextStageStarts = date;

  await game.save();
}

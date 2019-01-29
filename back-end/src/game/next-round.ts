import { IBeatmap } from '../models/Beatmap.model';
import { IGame } from '../models/Game.model';
import { Round } from '../models/Round.model';
import { checkPlayerScores } from './check-player-scores';

export async function nextRound(game: IGame, beatmap: IBeatmap) {
  const endsAt = new Date();
  endsAt.setSeconds(endsAt.getSeconds() + 10);

  const round = await Round.create({
    beatmap,
    endsAt,
  });

  game.status = 'in-progress';
  game.currentRound = round._id;
  game.roundNumber = (game.roundNumber || 0) + 1;

  console.log('starting round', game.roundNumber);

  // Update game status and set time to next stage
  game.nextStageStarts = endsAt;

  // Start pinging for user scores
  await checkPlayerScores(game, round);

  await game.save();
}

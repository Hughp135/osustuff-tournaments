import { IGame } from './../models/Game.model';
import { IRound } from './../models/Round.model';
import { Score, IScore } from '../models/Score.model';

// Kills players with lowest score each round
export async function roundEnded(game: IGame, round: IRound) {
  // Get scores sorted by score
  const scores = (await Score.find({ roundId: round._id }).sort({
    score: -1,
    date: 1,
  })).reduce(
    // reduce to only 1 score per user
    (acc, curr) => {
      if (!acc.some(s => s.userId === curr.userId)) {
        acc.push(curr);
      }
      return acc;
    },
    <IScore[]> [],
  );

  // Half the number of alive players each round.
  const numberOfWinners = Math.max(1, Math.floor(scores.length / 2));
  const winningScores = scores.slice(0, numberOfWinners);

  game.players.forEach(player => {
    player.alive = winningScores.some(
      s => s.userId.toString() === player.userId.toString(),
    );
    player.roundLostOn = player.alive ? undefined : <number> game.roundNumber;
  });
  game.status = 'round-over';

  const date = new Date();
  date.setSeconds(date.getSeconds() + 30);
  game.nextStageStarts = date;

  await game.save();
}

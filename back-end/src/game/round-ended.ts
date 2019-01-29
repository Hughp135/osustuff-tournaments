import { IGame } from './../models/Game.model';
import { IRound } from './../models/Round.model';
import { Score } from '../models/Score.model';
import { User } from '../models/User.model';

// Filters out players who lost the round based on score
export async function roundEnded(game: IGame, round: IRound) {
  game.status = 'round-over';
  await game.save();

  const scores = await Score.find({ roundId: round._id }).sort({ score: -1 });
  const numberOfWinners = Math.max(1, Math.floor(scores.length / 2));
  const winningScores = scores.splice(0, numberOfWinners);
  const winningUserIds = <string[]> (await Promise.all(
    winningScores.map(async s => {
      const user = await User.findById(s.userId);

      return user && <string> user._id.toString();
    }),
  )).filter(u => !!u);

  game.players.forEach(p => {
    p.alive = winningUserIds.includes(p.userId.toString());
  });

  console.log('Winning players', game.players.filter(p => p.alive).length);

  const date = new Date();
  date.setSeconds(date.getSeconds() + 30);
  game.nextStageStarts = date;

  await game.save();
}

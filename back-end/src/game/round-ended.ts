import { IGame, IPlayer } from './../models/Game.model';
import { IRound } from './../models/Round.model';
import { Score, IScore } from '../models/Score.model';
import { DURATION_ROUND_ENDED } from './durations';

// Kills players with lowest score each round
export async function roundEnded(game: IGame, round: IRound) {
  console.log('round ended');
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
  const alivePlayers = game.players.filter(p => p.alive);
  const roundsLeft = 10 - (game.roundNumber || 0);
  // const winRate = Math.pow(1.9 / alivePlayers.length, 1 / roundsLeft);
  // const winRate = game.roundNumber === 10 ? 1 : scores.length > 200 ? 0.4 : scores.length < 10 ? 0.5 : 0.6;
  const winRate = Math.max(0.4, 0.8 - 0.1 * (<number> game.roundNumber - 1));
  const numberOfWinners = Math.max(1, Math.floor(scores.length * winRate));
  const winningScores = scores.slice(0, numberOfWinners);
  console.log(
    'playersLeft',
    alivePlayers.length,
    'roundsLeft',
    roundsLeft,
    'winRate',
    winRate,
    'winners',
    numberOfWinners,
    'deadCount',
    alivePlayers.length - numberOfWinners,
  );

  game.players.forEach(player => {
    player.alive = winningScores.some(
      s => s.userId.toString() === player.userId.toString(),
    );
    player.roundLostOn = player.alive ? undefined : <number> game.roundNumber;
  });

  const deadPlayersNoScore = game.players.filter(
    p =>
      !p.alive &&
      !p.gameRank &&
      !scores.some(s => s.userId.toString() === p.userId.toString()),
  );

  console.log('players no score', deadPlayersNoScore.length);

  deadPlayersNoScore.forEach(player => {
    const lowestRank = getLowestRank(game);
    player.gameRank = lowestRank - 1;
  });

  const losingScores = scores.slice(numberOfWinners);
  losingScores.reverse().forEach(score => {
    const player = <IPlayer> (
      game.players.find(p => p.userId.toString() === score.userId.toString())
    );
    const lowestRank = getLowestRank(game);
    player.gameRank = lowestRank - 1;
  });

  game.status = 'round-over';
  const date = new Date();
  if (game.players.filter(p => p.alive).length > 1) {
    date.setSeconds(date.getSeconds() + DURATION_ROUND_ENDED);
  }
  game.nextStageStarts = date;

  await game.save();
}

function getLowestRank(game: IGame): number {
  const [lowestRank] = game.players
    .filter(p => !!p.gameRank)
    .sort((a, b) => <number> a.gameRank - <number> b.gameRank);

  return lowestRank ? <number> lowestRank.gameRank : game.players.length + 1;
}

import { IGame, IPlayer } from './../models/Game.model';
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
  const numberOfWinners = Math.min(25, Math.floor(scores.length / 2));
  const winningScores = scores.slice(0, numberOfWinners);

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

  deadPlayersNoScore.forEach(player => {
    const lowestRank = getLowestRank(game);
    player.gameRank = lowestRank - 1;
    console.log('player new rank', player.username, player.gameRank, 'previousLowest', lowestRank);
  });

  const losingScores = scores.slice(numberOfWinners);
  console.log('losingScores', losingScores.length);
  losingScores.reverse().forEach(score => {
    const player = <IPlayer> (
      game.players.find(p => p.userId.toString() === score.userId.toString())
    );
    const lowestRank = getLowestRank(game);
    player.gameRank = lowestRank - 1;
    console.log('player new rank', player.username, player.gameRank, 'previousLowest', lowestRank);
  });

  game.status = 'round-over';
  const date = new Date();
  date.setSeconds(date.getSeconds() + 60);
  game.nextStageStarts = date;

  await game.save();
}

function getLowestRank(game: IGame): number {
  const [lowestRank] = game.players
    .filter(p => !!p.gameRank)
    .sort((a, b) => <number> a.gameRank - <number> b.gameRank);

  return lowestRank ? <number> lowestRank.gameRank : game.players.length + 1;
}

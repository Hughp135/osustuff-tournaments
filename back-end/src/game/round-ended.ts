import { IUserResult } from './../models/User.model';
import { IGame, IPlayer } from './../models/Game.model';
import { IRound } from './../models/Round.model';
import { IScore } from '../models/Score.model';
import { DURATION_ROUND_ENDED } from './durations';
import { getAllUserBestScores } from './get-round-scores';
import { User } from 'src/models/User.model';
import { updatePlayerAchievements } from 'src/achievements/update-player-achievements';

// Kills players with lowest score each round
export async function roundEnded(game: IGame, round: IRound) {
  // Get scores sorted by score
  const scores = await getAllUserBestScores(round._id);

  await Promise.all(
    scores.map(async (score, idx) => {
      score.place = idx + 1;
      await score.save();
    }),
  );

  // Calculate which players lost the round.
  const winRate = Math.max(0.4, 0.8 - 0.1 * (<number> round.roundNumber - 1));
  const numberOfWinners =
    scores.length === 2 ? 1 : Math.max(1, Math.round(scores.length * winRate));
  const winningScores = scores.slice(0, numberOfWinners);

  await Promise.all(
    winningScores.map(async score => {
      score.passedRound = true;
      await score.save();
    }),
  );

  game.players.forEach(player => {
    player.alive = winningScores.some(s => s.userId.toString() === player.userId.toString());
    player.roundLostOn = player.alive ? undefined : <number> game.roundNumber;
  });

  const deadPlayerIds = game.players.filter(p => !p.alive).map(p => p.userId);

  await User.updateMany({ _id: deadPlayerIds }, { currentGame: undefined });
  await setPlayerRanksAndResults(game, scores, numberOfWinners);

  game.status = 'round-over';

  // Update next round start date
  const date = new Date();
  if (game.players.filter(p => p.alive).length > 1) {
    date.setSeconds(date.getSeconds() + DURATION_ROUND_ENDED);
  }
  game.nextStageStarts = date;

  await game.save();

  await updatePlayerAchievements(game);
}

async function setPlayerRanksAndResults(game: IGame, scores: IScore[], numberOfWinners: number) {
  const deadPlayersNoScore = game.players.filter(
    p => !p.alive && !p.gameRank && !scores.some(s => s.userId.toString() === p.userId.toString()),
  );

  const deadPlayers = deadPlayersNoScore.map(player => {
    const lowestRank = getLowestRank(game);
    player.gameRank = lowestRank - 1;
    return player;
  });

  const losingScores = scores.slice(numberOfWinners);
  const losingPlayers = await Promise.all(
    losingScores.reverse().map(async score => {
      score.passedRound = false;
      await score.save();

      const player = <IPlayer> (
        game.players.find(p => p.userId.toString() === score.userId.toString())
      );

      const lowestRank = getLowestRank(game);
      player.gameRank = lowestRank - 1;

      return player;
    }),
  );

  const dateEnded = new Date();
  await Promise.all(deadPlayers.concat(losingPlayers).map(async player => {
    const result: IUserResult = {
      gameId: game._id,
      place: <number> player.gameRank,
      gameEndedAt: dateEnded,
    };

    await User.updateOne({_id: player.userId}, { $addToSet: { results: result } });
  }));
}

function getLowestRank(game: IGame): number {
  const [lowestRank] = game.players
    .filter(p => !!p.gameRank)
    .sort((a, b) => <number> a.gameRank - <number> b.gameRank);

  return lowestRank ? <number> lowestRank.gameRank : game.players.length + 1;
}

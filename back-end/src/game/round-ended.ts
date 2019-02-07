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

  // Calculate which players lost the round.
  const winRate = Math.max(0.4, 0.8 - 0.1 * (<number> round.roundNumber - 1));
  const targetNumberOfWinners =
    scores.length === 2 ? 1 : Math.max(1, Math.round(scores.length * winRate));

  await setPlayerRanksAndResults(game, scores, targetNumberOfWinners);

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

async function setPlayerRanksAndResults(game: IGame, scores: IScore[], targetNumWinners: number) {
  console.log('target numWinners');
  const playersNoScore = game.players.filter(
    p => !scores.some(s => s.userId.toString() === p.userId.toString()),
  );
  const noScoreRank = getLowestRank(game) - playersNoScore.length;
  playersNoScore.forEach(player => {
    player.gameRank = noScoreRank;
    player.alive = false;
    player.roundLostOn = game.roundNumber;
  });

  // Set score places and determine winning scores
  await Promise.all(
    scores.map(async (score, idx, array) => {
      const prevScore = array[idx - 1] || { score: Infinity, place: 1, _id: '' };

      if (score.score > prevScore.score) {
        throw new Error('scores are not ordered descendingly');
      }

      const isDrawn = score.score === prevScore.score;
      score.place = isDrawn
        ? <number> prevScore.place +
          array.filter(
            s => s._id.toString() !== prevScore._id.toString() && s.place === prevScore.place,
          ).length
        : <number> prevScore.place + array.filter(s => s.place === prevScore.place).length;
      score.passedRound = isDrawn ? score.place <= targetNumWinners : idx < targetNumWinners;
      await score.save();
      console.log('isDraw', isDrawn, 'prevScore', prevScore.place, 'place', score.place);

      const player = <IPlayer> (
        game.players.find(p => p.userId.toString() === score.userId.toString())
      );

      player.alive = score.passedRound;
      if (!player.alive) {
        player.roundLostOn = game.roundNumber;
      }

      return player;
    }),
  );

  // Set losing score players' ranks
  scores
    .filter(s => {
      const player = <IPlayer> game.players.find(p => p.userId.toString() === s.userId.toString());
      return !player.alive;
    })
    .sort((a, b) => a.score - b.score)
    .forEach((score, idx, array) => {
      const prevScore = array[idx - 1] || { score: -1 };
      const isDrawn = score.score === prevScore.score;
      const prevPlayer = prevScore.userId
        ? <IPlayer> game.players.find(p => p.userId.toString() === prevScore.userId.toString())
        : { gameRank: getLowestRank(game) };
      if (!prevPlayer.gameRank) {
        console.error('prevScore', prevScore.userId);
        throw new Error('not a player' + prevPlayer);
      }
      const player = <IPlayer> (
        game.players.find(p => p.userId.toString() === score.userId.toString())
      );

      player.gameRank = isDrawn ? prevPlayer.gameRank : <number> prevPlayer.gameRank - 1;
    });

  await Promise.all(
    game.players
      .filter(p => p.roundLostOn === game.roundNumber)
      .map(async player => {
        const result: IUserResult = {
          gameId: game._id,
          place: <number> player.gameRank,
        };

        await User.updateOne(
          { _id: player.userId },
          { $addToSet: { results: result }, currentGame: undefined },
        );
      }),
  );
}

function getLowestRank(game: IGame): number {
  const [lowestRank] = game.players
    .filter(p => !!p.gameRank)
    .sort((a, b) => <number> a.gameRank - <number> b.gameRank);

  return lowestRank ? <number> lowestRank.gameRank : game.players.length + 1;
}

import { IUserResult } from './../models/User.model';
import { IGame, IPlayer } from './../models/Game.model';
import { IRound } from './../models/Round.model';
import { IScore } from '../models/Score.model';
import { DURATION_ROUND_ENDED } from './durations';
import { getAllUserBestScores } from './get-round-scores';
import { User } from '../models/User.model';
import { updatePlayerAchievements } from '../achievements/update-player-achievements';
import { cache } from '../services/cache';
import config from 'config';

const FAST_FORWARD_MODE = config.get('FAST_FORWARD_MODE');

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
  if (game.players.filter(p => p.alive).length > 1 && !FAST_FORWARD_MODE) {
    date.setSeconds(date.getSeconds() + DURATION_ROUND_ENDED);
  }
  game.nextStageStarts = date;

  await updatePlayerAchievements(game);
  await game.save();
  await cache.del(`get-lobby-users-${game._id}`);
}

async function setPlayerRanksAndResults(
  game: IGame,
  scores: IScore[],
  targetNumWinners: number,
) {
  rankNoScorePlayers(game, scores);

  await setScorePlaces(scores, targetNumWinners);

  rankLosingScorePlayers(game, scores);

  // Save all losing users
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

function rankNoScorePlayers(game: IGame, scores: IScore[]) {
  const playersNoScore = game.players.filter(
    p => p.alive && !scores.some(s => s.userId.toString() === p.userId.toString()),
  );
  const noScoreRank = game.players.filter(p => p.alive).length;

  playersNoScore.forEach(player => {
    player.gameRank = noScoreRank;
    player.alive = false;
    player.roundLostOn = game.roundNumber;
  });
}

function rankLosingScorePlayers(game: IGame, scores: IScore[]) {
  // Group all scores by place
  const scoresByPlace = scores
    .filter(s => !s.passedRound)
    .reduce(
      (acc: Array<{ place: number; scores: IScore[] }>, curr) => {
        const placeScores = acc.find(x => x.place === curr.place);
        if (placeScores) {
          placeScores.scores.push(curr);
        } else {
          acc.push({ place: <number> curr.place, scores: [curr] });
        }
        return acc;
      },
      <Array<{ place: number; scores: [] }>> [],
    );

  // Give all scores with same place the same rank
  scoresByPlace
    .sort((a, b) => b.place - a.place)
    .forEach(withSamePlace => {
      const lowestRank = game.players.filter(p => p.alive).length;
      const countScoresSamePlace = withSamePlace.scores.length - 1;

      withSamePlace.scores.forEach(score => {
        const player = <IPlayer> (
          game.players.find(p => p.userId.toString() === score.userId.toString())
        );
        player.gameRank = lowestRank - countScoresSamePlace;
        player.alive = false;
        player.roundLostOn = game.roundNumber;
      });
    });
}

async function setScorePlaces(scores: IScore[], targetNumWinners: number) {
  // Set score places
  await Promise.all(
    scores.map(async (score, idx, array) => {
      const prevScore = array[idx - 1] || { score: Infinity, place: 1, _id: '' };

      if (score.score > prevScore.score) {
        throw new Error('scores are not ordered descendingly');
      }

      const isDrawn = score.score === prevScore.score;
      score.place = isDrawn
        ? <number> prevScore.place
        : <number> prevScore.place + array.filter(s => s.place === prevScore.place).length;
      score.passedRound = isDrawn
        ? score.place <= targetNumWinners
        : idx < targetNumWinners;

      await score.save();

      return score;
    }),
  );
}

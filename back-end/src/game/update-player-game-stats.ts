import { Skill } from './../services/trueskill';
import { User, IUser, IUserResult } from '../models/User.model';
import { IPlayer, IGame } from '../models/Game.model';
import { Rating } from 'ts-trueskill';
import { logger } from '../logger';

export async function updatePlayerGameStats(game: IGame) {
  const playerCount = game.players.length;

  const rankedPlayers: Array<IPlayer & { user: IUser }> = await Promise.all(
    game.players
      .filter(p => !!p.gameRank)
      .map(async (p: IPlayer & { user?: IUser }) => {
        p.user = <IUser> await User.findOne({ osuUserId: p.osuUserId });
        if (p.gameRank === 1) {
          p.user.wins++;
        }
        p.user.averageRank =
          ((p.user.averageRank || 0) * p.user.gamesPlayed + <number> p.gameRank) /
          (p.user.gamesPlayed + 1);
        p.user.gamesPlayed++;

        const gamePercentile = <number> p.gameRank / playerCount;

        if (gamePercentile <= 0.1) {
          p.user.percentiles.top10++;
        }

        if (gamePercentile <= 0.2) {
          p.user.percentiles.top20++;
        }

        if (gamePercentile <= 0.5) {
          p.user.percentiles.top50++;
        }

        p.user.markModified('percentiles');

        return <IPlayer & { user: IUser }> p;
      }),
  );

  updatePlayerRatings(rankedPlayers, game);

  await Promise.all(rankedPlayers.map(async p => {
    await p.user.save();
  }));
}

function updatePlayerRatings(
  rankedPlayers: Array<IPlayer & { user: IUser }>,
  game: IGame,
) {
  const ratings = rankedPlayers.map(p => [
    Skill.createRating(p.user.rating.mu, p.user.rating.sigma),
  ]);
  if (rankedPlayers.length < 1) {
    console.log(rankedPlayers);
    logger.info('Not updating stats because only 1 or less players were ranked');
    return;
  }
  const rankings = rankedPlayers.map(p => <number> p.gameRank);
  const results = Skill.rate(ratings, rankings) as Rating[][];

  results.forEach(([r], index) => {
    const player = rankedPlayers[index];
    const oldRating = player.user.rating;
    const ratingChange =  r.mu - oldRating.mu;
    const sigmaChange = r.sigma - oldRating.sigma;

    player.user.rating = {
      mu: game.minRank ? player.user.rating.mu + (ratingChange / 5) : r.mu,
      sigma: game.minRank ? player.user.rating.sigma + (sigmaChange / 5) : r.sigma,
    };

    const gameEndedAt = new Date();
    const userResult = <IUserResult> (
      player.user.results.find(res => res.gameId.toHexString() === game._id.toString())
    );

    if (userResult) {
      userResult.gameEndedAt = gameEndedAt;
      userResult.ratingChange = player.user.rating.mu - oldRating.mu;
      userResult.ratingBefore = oldRating.mu;
      userResult.ratingAfter = player.user.rating.mu;
    }
  });
}

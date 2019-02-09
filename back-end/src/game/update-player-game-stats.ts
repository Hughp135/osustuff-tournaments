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
  const rankings = rankedPlayers.map(p => <number> p.gameRank);
  const results =
    rankedPlayers.length > 1 ? (Skill.rate(ratings, rankings) as Rating[][]) : undefined;
  if (!results) {
    logger.info('Not updating stats because only 1 or less players were ranked');
    return;
  }
  results.forEach(([r], index) => {
    const player = rankedPlayers[index];
    const oldRating = player.user.rating.mu;
    player.user.rating = {
      mu: r.mu,
      sigma: r.sigma,
    };
    const gameEndedAt = new Date();
    const userResult = <IUserResult> (
      player.user.results.find(res => res.gameId.toHexString() === game._id.toString())
    );
    if (userResult) {
      userResult.gameEndedAt = gameEndedAt;
      userResult.ratingChange = player.user.rating.mu - oldRating;
    }
  });
}

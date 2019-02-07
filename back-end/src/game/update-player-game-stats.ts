import { Skill } from './../services/trueskill';
import { User, IUser } from '../models/User.model';
import { IPlayer } from '../models/Game.model';
import { Rating } from 'ts-trueskill';
import { Types } from 'mongoose';

export async function updatePlayerGameStats(game: { players: IPlayer[] }) {
  const playerCount = game.players.length;
  const rankedPlayers: Array<IPlayer & { user: IUser }> = await Promise.all(
    game.players
      .filter(p => !!p.gameRank)
      // .sort((a, b) => <number> a.gameRank - <number> b.gameRank)
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

  await calculatePlayerRatings(rankedPlayers);

  await Promise.all(
    rankedPlayers.map(async p => {
      await p.user.save();
    }),
  );
}

async function calculatePlayerRatings(rankedPlayers: Array<IPlayer & { user: IUser }>) {
  const ratings = rankedPlayers.map(p => [
    Skill.createRating(p.user.rating.mu, p.user.rating.sigma),
  ]);
  const rankings = rankedPlayers.map(p => <number> p.gameRank);
  const results = Skill.rate(ratings, rankings) as Rating[][];

  // console.log('flattenedResults', flattenedResults.map(r => r.toString()));
  results.forEach(([r], index) => {
    const player = rankedPlayers[index];
    player.user.rating = {
      mu: r.mu,
      sigma: r.sigma,
    };
  });
}

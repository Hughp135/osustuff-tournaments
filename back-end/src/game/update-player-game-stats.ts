import { User, IUser } from '../models/User.model';
import { IPlayer } from '../models/Game.model';

const eloRating = require('elo-rating');

export async function updatePlayerGameStats(game: { players: IPlayer[] }) {
  const playerCount = game.players.length;
  const rankedPlayers: Array<IPlayer & { user: IUser }> = await Promise.all(
    game.players
      .filter(p => !!p.gameRank)
      .sort((a, b) => <number> b.gameRank - <number> a.gameRank)
      .map(async (p: IPlayer & { user?: IUser }) => {
        p.user = <IUser> await User.findOne({ osuUserId: p.osuUserId });
        p.user.gamesPlayed++;
        if (p.gameRank === 1) {
          p.user.wins++;
        }
        const gamePercentile = <number> p.gameRank / playerCount;

        console.log('player rank', p.gameRank, 'percentil', gamePercentile);

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

        console.log('after', p.user.percentiles);

        return <IPlayer & { user: IUser }> p;
      }),
  );

  await calculatePlayerElo(rankedPlayers);

  await Promise.all(
    rankedPlayers.map(async p => {
      await p.user.save();
    }),
  );
}

async function calculatePlayerElo(rankedPlayers: Array<IPlayer & { user: IUser }>) {
  const kValue = 10 / Math.max(Math.log(Math.max(rankedPlayers.length, 10)) / Math.LN10);

  await Promise.all(
    rankedPlayers.map(async player1 => {
      let eloChange = 0;
      const otherPlayers = rankedPlayers.filter(p => p.osuUserId !== player1.osuUserId);

      await Promise.all(
        otherPlayers.map(async player2 => {
          const playerWin = <number> player1.gameRank < <number> player2.gameRank;
          const { playerRating } = eloRating.calculate(
            player1.user.elo,
            player2.user.elo,
            playerWin,
            kValue,
          );
          eloChange += playerRating - player1.user.elo;
        }),
      );
      player1.user.elo += eloChange;
    }),
  );
}

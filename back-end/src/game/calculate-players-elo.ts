import { User, IUser } from '../models/User.model';
import { IPlayer } from '../models/Game.model';

const eloRating = require('elo-rating');

export async function calculatePlayersElo(game: { players: IPlayer[] }) {
  const rankedPlayers: Array<IPlayer & { user: IUser }> = await Promise.all(
    game.players
      .filter(p => !!p.gameRank)
      .sort((a, b) => <number> b.gameRank - <number> a.gameRank)
      .map(async (p: any) => {
        p.user = await User.findOne({ osuUserId: p.osuUserId });
        return p;
      }),
  );

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
          );
          eloChange += playerRating - player1.user.elo;
        }),
      );
      player1.user.elo += eloChange;
    }),
  );

  await Promise.all(
    rankedPlayers.map(async p => {
      await p.user.save();
    }),
  );
}

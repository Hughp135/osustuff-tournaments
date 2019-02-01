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
      const otherPlayers = rankedPlayers.filter(p => p.osuUserId !== player1.osuUserId);

      await Promise.all(
        otherPlayers.map(async player2 => {
          const playerWin = <number> player1.gameRank < <number> player2.gameRank;
          console.log(
            player1.username,
            player1.gameRank,
            player2.username,
            player2.gameRank,
            'win',
            playerWin,
          );

          const { playerRating, opponentRating } = eloRating.calculate(
            player1.user.elo,
            player2.user.elo,
            playerWin,
            5,
          );

          player1.user.elo = playerRating;
          player2.user.elo = opponentRating;

          // console.log('1', player1.user.elo, '2', player2.user.elo);
        }),
      );
    }),
  );

  await Promise.all(
    rankedPlayers.map(async p => {
      await p.user.save();
    }),
  );
}

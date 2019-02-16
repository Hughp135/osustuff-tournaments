import { Request, Response } from 'express';
import { User } from '../../../models/User.model';
import { Game } from '../../../models/Game.model';

export async function kickPlayer(req: Request, res: Response) {
  const { username }: { username: string } = (<any>req).claim || {};
  const { osuUserId, gameId } = req.params;

  if (!username) {
    return res.status(401).json({ error: 'You must be logged in' });
  }

  const game = await Game.findOne({ _id: gameId });

  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }

  const user = await User.findOne({ username });

  if (
    !user ||
    !(
      user.roles.includes('moderator') ||
      (game.owner && game.owner.toString() === user._id.toString())
    )
  ) {
    return res.status(401).json({ error: 'You are not allowed to do that.' });
  }

  if (!osuUserId || !gameId) {
    return res.status(401).json({ error: 'Params not set' });
  }

  const userToKick = await User.findOne({ osuUserId: parseInt(osuUserId, 10) });

  if (!userToKick) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (
    userToKick.currentGame &&
    userToKick.currentGame.toHexString() === game._id.toString()
  ) {
    userToKick.currentGame = undefined;
    await userToKick.save();
  }

  const player = game.players.find(
    p => p.osuUserId.toString() === userToKick.osuUserId.toString(),
  );
  if (player) {
    player.alive = false;
    player.kicked = true;
    if (game.roundNumber) {
      player.roundLostOn = game.roundNumber;
    }
    if (game.status === 'new') {
      game.players = game.players.filter(
        p => p.osuUserId.toString() !== userToKick.osuUserId.toString(),
      );
    }
    game.markModified('players');

    await game.save();
  }

  res.status(200).end();
}

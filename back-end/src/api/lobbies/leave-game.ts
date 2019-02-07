import { Request, Response } from 'express';
import { Game } from '../../models/Game.model';
import { User } from '../../models/User.model';
import { cache } from '../../services/cache';

export async function leaveGame(req: Request, res: Response) {
  const { username } = req.app.get('claim');

  const game = await Game.findById(req.params.id);

  if (!game) {
    return res.status(404).end();
  }

  if (game.status === 'new') {
    game.players = game.players.filter(p => p.username !== username);
    await game.save();
    await cache.del(`get-lobby-users-${game._id}`);
  } else {
    const player = game.players.find(p => p.username === username);

    if (player) {
      player.alive = false;

      await game.save();
    }
  }

  const user = await User.findOne({ username });

  if (user) {
    user.currentGame = undefined;
    await user.save();
  }

  res.status(200).end();
}

import { Request, Response } from 'express';
import { Game } from '../../models/Game.model';
import { getUser } from '../../services/osu-api';
import { updateOrCreateUser } from '../../models/User.model';
import { addPlayer } from '../../game/add-player';
import { cache } from 'src/services/cache';

export async function joinGame(req: Request, res: Response) {
  const game = await Game.findById(req.params.id);

  const claim = req.app.get('claim');

  const osuUser = await getUser(claim.username);

  if (!osuUser) {
    return res.status(404).json({ error: 'Failed to retrieve osu user details.' });
  }

  const user = await updateOrCreateUser(osuUser);

  if (!game) {
    return res.status(404).end();
  }

  if (game.status !== 'new') {
    return res.status(400).end();
  }

  if (game.players.length >= 1000) {
    return res.status(423).end();
  }

  await addPlayer(game, user);

  await cache.del(`get-lobby-users-${game._id}`);

  res.status(200).end();
}

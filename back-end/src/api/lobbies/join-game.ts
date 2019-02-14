import { Request, Response } from 'express';
import { Game } from '../../models/Game.model';
import { getUser } from '../../services/osu-api';
import { updateOrCreateUser } from '../../models/User.model';
import { addPlayer } from '../../game/add-player';
import { cache } from '../../services/cache';

export async function joinGame(req: Request, res: Response) {
  const game = await Game.findById(req.params.id);

  if (!game) {
    return res.status(404).end();
  }

  const claim = (<any> req).claim;
  if (!claim) {
    return res.status(401).end();
  }

  const osuUser = await getUser(claim.username);

  if (!osuUser) {
    return res.status(404).json({ error: 'Failed to retrieve osu user details.' });
  }

  if (game.minRank && osuUser.pp_rank < game.minRank) {
    return res.status(401).json({ error: `Only rank ${game.minRank} players and above can join this lobby.`});
  }

  const user = await updateOrCreateUser(osuUser);

  // Store that user is active
  cache.put(`user-active-${user._id}`, true, 60000);

  if (game.status !== 'new') {
    return res.status(400).end();
  }

  if (game.players.length >= 1000) {
    return res.status(423).end();
  }

  if (game.players.some(p => p.username === claim.username)) {
    return res.status(400).end();
  }

  await addPlayer(game, user);

  await cache.del(`get-lobby-users-${game._id}`);

  res.status(200).end();
}

import { Request, Response } from 'express';
import { Game } from '../../models/Game.model';
import { getUser } from '../../services/osu-api';
import { updateOrCreateUser } from '../../models/User.model';
import { addPlayer } from '../../game/add-player';
import { cache } from '../../services/cache';
import { addOnlineUser } from '../../helpers/add-online-user';
import { sendPlayersToSocket } from '../../game/players/update-players';
import { getSampleOsuUser } from '../../test-helpers/add-sample-players';

export async function joinGame(req: Request, res: Response) {
  const game = await Game.findById(req.params.id);
  if (!game) {
    return res.status(404).end();
  }

  const claim = (<any>req).claim;
  if (!claim || !claim.username) {
    return res.status(401).end();
  }

  const osuUser =
    claim.username === 'x'
      ? getSampleOsuUser() // test mode
      : await getUser(claim.username);

  if (!osuUser) {
    return res
      .status(404)
      .json({ error: 'Failed to retrieve osu user details.' });
  }

  if (game.minRank && parseInt(osuUser.pp_rank, 10) < game.minRank) {
    return res.status(401).json({
      error: `Only rank ${game.minRank} and above players can join this lobby.`,
    });
  }

  if (game.maxRank && parseInt(osuUser.pp_rank, 10) > game.maxRank) {
    return res.status(401).json({
      error: `Only rank ${game.maxRank} and under players can join this lobby.`,
    });
  }

  const user = await updateOrCreateUser(osuUser);

  console.log('ading user', user.username, user._id);

  if (user.banned) {
    return res.status(401).end();
  }

  // Store that user is active
  addOnlineUser(user);
  cache.put(`user-active-${user._id}`, true, claim.username === 'x' ? 10000 : 60000);

  if (game.status !== 'new') {
    return res.status(400).end();
  }

  if (game.players.length >= 450) {
    return res.status(423).end();
  }

  if (game.players.some(p => p.username === claim.username)) {
    return res.status(400).end();
  }

  await addPlayer(game, user);

  await cache.del(`get-lobby-users-${game._id}`);

  res.status(200).end(); // end request

  await sendPlayersToSocket(game); // after request ended (not critical for joining)
}

import { Request, Response } from 'express';
import { Game } from '../../models/Game.model';
import { JoinGameRequest } from '../../models/JoinGameRequest.model';
import { getUser } from '../../services/osu-api';
import { updateOrCreateUser } from '../../models/User.model';
import { achievementPlayAsTester } from '../../achievements/play-as-tester';

export async function joinGame(req: Request, res: Response) {
  const game = await Game.findById(req.params.id);

  if (!game) {
    return res.status(404).end();
  }

  if (game.status !== 'new') {
    return res.status(400).end();
  }

  if (game.players.length >= 1000) {
    return res.status(423).end();
  }

  const osuUser = await getUser(req.body.username);

  if (!osuUser) {
    return res.status(404).json({ error: 'No osu user with that username was found.' });
  }

  const expiryDate = new Date();
  expiryDate.setSeconds(expiryDate.getSeconds() + 60);

  await JoinGameRequest.deleteMany({
    username: osuUser.username,
  });

  const joinRequest = await JoinGameRequest.create({
    username: osuUser.username,
    gameId: game._id,
    expiresAt: expiryDate,
  });

  res.json({
    requestId: joinRequest._id,
    username: osuUser.username,
  });

  const user = await updateOrCreateUser(osuUser);
  await achievementPlayAsTester(user);
}

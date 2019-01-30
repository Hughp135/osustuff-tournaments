import { Request, Response } from 'express';
import { Game } from '../../models/Game.model';
import { JoinGameRequest } from '../../models/JoinGameRequest.model';
import { getUser } from '../../services/osu-api';
import { User, IUser } from '../../models/User.model';

export async function joinGame(req: Request, res: Response) {
  const game = await Game.findById(req.params.id);

  if (!game) {
    return res.status(404).end();
  }

  if (game.status !== 'new') {
    return res.status(400).end();
  }

  const osuUser = await getUser(req.body.username);
  console.log('osuUser', osuUser);
  if (!osuUser) {
    return res
      .status(404)
      .json({ error: 'No osu user with that username was found.' });
  }

  const expiryDate = new Date();
  expiryDate.setSeconds(expiryDate.getSeconds() + 60);

  await JoinGameRequest.deleteMany({
    username: req.body.username,
  });

  const joinRequest = await JoinGameRequest.create({
    username: req.body.username,
    gameId: game._id,
    expiresAt: expiryDate,
  });

  res.json({
    requestId: joinRequest._id,
  });

  await updateOrCreateUser(req.body.username, osuUser);
}

async function updateOrCreateUser(
  username: string,
  osuUser: any,
): Promise<IUser> {
  const found = await User.findOne({ username });
  const ppRank = parseInt(osuUser.pp_rank, 10);
  const countryRank = parseInt(osuUser.pp_country_rank, 10);
  const osuUserId = parseInt(osuUser.user_id, 10);

  if (found) {
    found.ppRank = ppRank;
    found.countryRank = countryRank;
    found.country = osuUser.country;
    found.osuUserId = osuUserId;

    return await found.save();
  }

  return await User.create({
    username,
    osuUserId,
    ppRank,
    countryRank,
    country: osuUser.country,
  });
}
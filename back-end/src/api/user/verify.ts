import { Request, Response } from 'express';
import config from 'config';
import { JoinGameRequest } from '../../models/JoinGameRequest.model';
import { User } from '../../models/User.model';
import { addPlayer } from '../../game/add-player';
import { Game } from '../../models/Game.model';
import winston from 'winston';

const VERIFY_USER_TOKEN = config.get('VERIFY_USER_TOKEN');

export async function verifyUser(req: Request, res: Response) {
  const { username, token } = req.body;

  if (token !== VERIFY_USER_TOKEN) {
    return res.status(401).end();
  }

  const verifyRequest = await JoinGameRequest.findOne({ username });

  if (!verifyRequest) {
    return res.status(404).end();
  }

  winston.log('info', 'verifyRequest', [
    verifyRequest.username,
    verifyRequest.verified,
    verifyRequest.expiresAt,
    verifyRequest.gameId,
  ]);

  if (verifyRequest.verified) {
    return res.status(401).end();
  }

  if (verifyRequest.expiresAt < new Date()) {
    return res.status(408).end();
  }

  const user = await getUser(verifyRequest.username);
  const game = await Game.findById(verifyRequest.gameId);

  if (!game) {
    return res.status(404).end();
  }

  // return res.status(409).end(); // conflict (if user already added)
  if (!game.players.some(p => p.userId.toString() === user._id.toString())) {
    await addPlayer(game, user);
  }

  verifyRequest.verified = true;
  await verifyRequest.save();

  res.status(200).end();
}

async function getUser(username: string) {
  const found = await User.findOne({ username });

  if (!found) {
    throw new Error('User not found ' + username);
  }

  return found;
}

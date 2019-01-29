import { Request, Response } from 'express';
import config from 'config';
import { JoinGameRequest } from '../../models/JoinGameRequest.model';

const VERIFY_USER_TOKEN = config.get('VERIFY_USER_TOKEN');

export async function verifyUser(req: Request, res: Response) {
  const { username, token } = req.body;

  console.log('token', token, 'username', username);
  if (token !== VERIFY_USER_TOKEN) {
    return res.status(401).end();
  }

  const verifyRequest = await JoinGameRequest.findOne({ username });

  if (!verifyRequest) {
    return res.status(404).end();
  }

  if (verifyRequest.expiresAt < new Date()) {
    res.status(408).end();
  }

  verifyRequest.verified = true;
  await verifyRequest.save();

  console.log('verifying user', username);
  res.status(200).end();
}

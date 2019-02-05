import { Request, Response } from 'express';
import { Game } from '../../models/Game.model';
import config from 'config';
import { User } from '../../models/User.model';
import { Round } from '../../models/Round.model';
import { Message } from '../../models/Message.model';
import { Score } from '../../models/Score.model';

export async function clearDb(req: Request, res: Response) {
  if (req.body.pw !== config.get('ADMIN_PASS')) {
    return res.status(401).end();
  }

  await Game.deleteMany({});
  await Round.deleteMany({});
  await User.deleteMany({});
  await Message.deleteMany({});
  await Score.deleteMany({});

  res.status(200).end();
}

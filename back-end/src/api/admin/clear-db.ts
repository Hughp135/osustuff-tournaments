import { Request, Response } from 'express';
import { Game } from '../../models/Game.model';
import config from 'config';
import { User } from '../../models/User.model';
import { Round } from '../../models/Round.model';
import { Message } from '../../models/Message.model';
import { Score } from '../../models/Score.model';
import { Achievement } from '../../models/Achievement.model';

export async function clearDb(req: Request, res: Response) {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).end();
  }

  if (req.body.pw !== config.get('ADMIN_PASS')) {
    return res.status(401).end();
  }

  await Game.deleteMany({});
  await Round.deleteMany({});
  await User.deleteMany({});
  await Message.deleteMany({});
  await Score.deleteMany({});
  await Achievement.deleteMany({});

  res.status(200).end();
}

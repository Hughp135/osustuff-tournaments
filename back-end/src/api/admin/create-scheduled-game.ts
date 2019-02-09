import { Request, Response } from 'express';
import config from 'config';
import { createScheduledGame } from '../../game/monitor-running-games';

export async function makeScheduledGame(req: Request, res: Response) {
  if (req.body.pw !== config.get('ADMIN_PASS')) {
    return res.status(401).end();
  }

  if (!req.body.date) {
    return res.status(400).end();
  }

  await createScheduledGame(new Date(Date.parse(req.body.date)));

  res.status(200).end();
}

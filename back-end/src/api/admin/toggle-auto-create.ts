import { Request, Response } from 'express';
import config from 'config';
import { toggleAutoCreation } from '../../game/monitor-running-games';

export async function toggleAutoCreateReq(req: Request, res: Response) {
  if (req.body.pw !== config.get('ADMIN_PASS')) {
    return res.status(401).end();
  }

  await toggleAutoCreation();

  res.status(200).end();
}

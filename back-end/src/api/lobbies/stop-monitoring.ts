import { Request, Response } from 'express';
import {
  stopMonitoring,
  isMonitoring,
  startMonitoring,
} from '../../game/monitor-running-games';
import config from 'config';

export async function toggleMonitoring(req: Request, res: Response) {
  if (req.body.pw !== config.get('ADMIN_PASS')) {
    return res.status(401).end();
  }

  if (isMonitoring) {
    stopMonitoring();
  } else {
    await startMonitoring();
  }

  res.status(200).end();
}

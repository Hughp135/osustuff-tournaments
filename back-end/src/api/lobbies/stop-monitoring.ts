import { Request, Response } from 'express';
import {
  stopMonitoring,
  isMonitoring,
  startMonitoring,
} from '../../game/monitor-running-games';

export async function toggleMonitoring(req: Request, res: Response) {
  console.log('ismotniroing', isMonitoring);
  if (isMonitoring) {
    stopMonitoring();
  } else {
    await startMonitoring();
  }

  res.status(200).end();
}

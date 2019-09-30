import { Request, Response } from 'express';
import { Achievement } from '../../models/Achievement.model';
import { logger } from '../../logger';

export async function getAllAchievements(req: Request, res: Response) {
  // TODO: clean up the error checking
  // turn into a function?
  Achievement.find({}, (err: Error, docs) => {
    if (err) {
      logError(res, err, false);
      return;
    }
    try {
      res.json(docs);
    } catch (e) {
      logError(res, e, true);
    }
  });
}

function logError(resp: Response, error: Error, sending: boolean) {
  resp.status(500).send(error).end();
  const x = sending ? 'send' : 'query';
  logger.error(`Error while ${x}ing all achievements: ${error.stack}`);
}

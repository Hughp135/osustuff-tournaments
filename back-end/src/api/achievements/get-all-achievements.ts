import { Request, Response } from 'express';
import { Achievement } from '../../models/Achievement.model';
import { logger } from '../../logger';

export async function getAllAchievements(req: Request, res: Response) {
  // TODO: clean up the error checking
  // turn into a function?
  Achievement.find({}, (err, docs) => {
    if (err) {
      res.status(500).send(err).end();
      logger.error('Error while querying all achievements: ' + err);
      return;
    }
    try {
      res.json(docs);
    }
    catch (e) {
      res.status(500).send(e).end();
      logger.error('Error while sending all achievements: ' + e);
    }
  });
}

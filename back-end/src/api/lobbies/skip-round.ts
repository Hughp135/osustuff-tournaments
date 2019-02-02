import { Request, Response } from 'express';
import { Game } from '../../models/Game.model';
import config from 'config';

export async function skipRound(req: Request, res: Response) {
  if (req.body.pw !== config.get('ADMIN_PASS')) {
    return res.status(401).end();
  }

  const { id } = req.params;

  const game = await Game.findById(id);

  if (!game) {
    return res.status(404).end();
  }

  game.nextStageStarts = new Date();

  await game.save();

  res.status(200).end();
}

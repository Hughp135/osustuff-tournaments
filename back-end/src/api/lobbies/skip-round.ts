import { Request, Response } from 'express';
import { Game } from '../../models/Game.model';

export async function skipRound(req: Request, res: Response) {
  const { id } = req.params;

  const game = await Game.findById(id);

  if (!game) {
    return res.status(404).end();
  }

  game.nextStageStarts = new Date();

  await game.save();

  res.status(200).end();
}

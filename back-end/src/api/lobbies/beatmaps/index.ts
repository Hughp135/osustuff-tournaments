import { Request, Response } from 'express';
import { Game } from '../../../models/Game.model';
import { Types } from 'mongoose';

export async function getLobbyBeatmaps(req: Request, res: Response) {
  const { id } = req.params;

  if (!Types.ObjectId.isValid(id)) {
    return res.status(404).end();
  }

  const game = await Game.findById(id)
    .select({
      beatmaps: 1,
    })
    .lean();

  if (!game) {
    return res.status(404).end();
  }

  return res.json(game.beatmaps);
}

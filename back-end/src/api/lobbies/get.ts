import { Game } from '../../models/Game.model';
import { Request, Response } from 'express';

export async function getLobby(req: Request, res: Response) {
  const game = await Game.findOne({}).sort({ _id: -1 });

  res.json(game);
}

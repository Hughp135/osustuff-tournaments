import { Game } from '../../models/Game.model';
import { Request, Response } from 'express';
import { Round } from '../../models/Round.model';

export async function getLobby(req: Request, res: Response) {
  const { id } = req.params;

  const game = await Game.findById(id).lean();

  if (!game) {
    return res.status(404).end();
  }

  const round = await Round.findById(game.currentRound).lean();

  const data = {
    ...game,
    round,
  };

  res.json(data);
}

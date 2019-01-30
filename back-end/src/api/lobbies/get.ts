import { Game } from '../../models/Game.model';
import { Request, Response } from 'express';
import { Round } from '../../models/Round.model';
import mongoose from 'mongoose';

export async function getLobby(req: Request, res: Response) {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).end();
  }

  const game = await Game.findById(id)
    .select({
      title: 1,
      nextStageStarts: 1,
      roundNumber: 1,
      status: 1,
      createdAt: 1,
      currentRound: 1,
      currentRoundNumber: 1,
      players: 1,
    })
    .lean();

  if (!game) {
    return res.status(404).end();
  }

  const secondsToNextRound = game.nextStageStarts
    ? (game.nextStageStarts.getTime() - Date.now()) / 1000
    : undefined;

  const round = await Round.findById(game.currentRound)
    .select({ beatmap: 1 })
    .lean();

  const data = {
    ...game,
    round,
    secondsToNextRound,
  };

  res.json(data);
}

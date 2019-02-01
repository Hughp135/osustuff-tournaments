import { Response, Request } from 'express';
import mongoose from 'mongoose';
import { Round } from '../../../models/Round.model';
import { Score } from '../../../models/Score.model';

export async function getRoundScores(req: Request, res: Response) {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).end();
  }

  const scores = await Score.find({roundId: id, passedRound: [true, false]});

  res.json(scores);
}

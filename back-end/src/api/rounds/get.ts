import { Response, Request } from 'express';
import mongoose from 'mongoose';
import { Round } from '../../models/Round.model';
import { getRoundScores } from '../../game/get-round-scores';

export async function getRound(req: Request, res: Response) {
  const { id, roundNum } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).end();
  }

  const round = await Round.findOne({ gameId: id, roundNumber: parseInt(roundNum, 10) }).lean();
  round.scores = await getRoundScores(round._id);

  res.json(round);
}

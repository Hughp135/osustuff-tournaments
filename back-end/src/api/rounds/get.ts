import { Response, Request } from 'express';
import mongoose from 'mongoose';
import { Round } from '../../models/Round.model';
import { Score } from '../../models/Score.model';

export async function getRoundScores(req: Request, res: Response) {
  const { id, roundNum } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).end();
  }

  const round = await Round.findOne({ gameId: id, roundNumber: parseInt(roundNum, 10) }).lean();
  round.scores = await Score.find({ roundId: round._id })
    .sort({ score: -1 })
    .select({
      userId: 0,
      _id: 0,
      updatedAt: 0,
      __v: 0,
      roundId: 0,
    })
    .lean();

  res.json(round);
}

import { IScore } from '../models/Score.model';
import { Types } from 'mongoose';
import { Score } from '../models/Score.model';

export async function getRoundScores(roundId: Types.ObjectId) {
  return  (await Score.find({ roundId }).sort({
    score: -1,
    date: 1,
  })).reduce(
    // reduce to only 1 score per user
    (acc, curr) => {
      if (!acc.some(s => s.userId.toString() === curr.userId.toString())) {
        acc.push(curr);
      }
      return acc;
    },
    <IScore[]> [],
  );
}

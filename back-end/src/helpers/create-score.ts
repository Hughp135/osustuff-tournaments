import { IUser } from '../models/User.model';
import { ObjectId } from 'bson';
import { Score } from '../models/Score.model';
import { IGame } from '../models/Game.model';

interface IScoreDataArguments {
  accuracy?: number;
  rank?: string;
  mods?: number;
  score?: number;
  maxCombo?: number;
  misses?: number;
  game?: IGame;
}

function createScoreData(user: IUser, params: IScoreDataArguments) {
  return {
    gameId: params.game === undefined ? new ObjectId() : params.game._id,
    score: params.score === undefined ? 10 : params.score,
    username: user.username,
    roundId: new ObjectId(),
    userId: user._id,
    rank: params.rank === undefined ? 'S' : params.rank,
    mods: params.mods === undefined ? 0 : params.mods,
    maxCombo: params.maxCombo === undefined ? 100 : params.maxCombo,
    accuracy: params.accuracy === undefined ? 99 : params.accuracy,
    misses: params.misses === undefined ? 0 : params.misses,
    count100: 1,
    date: new Date(),
    passedRound: true,
  };
}

export async function createScore(user: IUser, params: IScoreDataArguments) {
  return await Score.create({ ...createScoreData(user, params) });
}

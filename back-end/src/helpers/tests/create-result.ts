import { IUser } from '../../models/User.model';
import { IGame } from '../../models/Game.model';
import { ObjectID } from 'bson';

interface IResultDataArguments {
  game?: IGame;
  place?: number;
  gamePlayers?: number;
  gameEndedAt?: Date;
}

export async function createResult(user: IUser, params: IResultDataArguments) {
  user.results.push({
    gameId: params.game === undefined ? new ObjectID() : params.game._id,
    place: params.place === undefined ? 1 : params.place,
    gamePlayers: params.gamePlayers === undefined ? 2 : params.gamePlayers,
    gameEndedAt: params.gameEndedAt === undefined ? new Date() : params.gameEndedAt,
    ratingBefore: { mu: 0, sigma: 0, weighted: 0 },
    ratingAfter: { mu: 0, sigma: 0, weighted: 0 },
  });
}

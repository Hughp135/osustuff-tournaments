import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { User } from '../../../models/User.model';
import { Message } from '../../../models/Message.model';
import { ObjectID } from 'bson';
import { cache } from '../../../services/cache';
import { Game } from '../../../models/Game.model';
const Filter = require('bad-words');

const filter = new Filter();
filter.addWords('rape');

export async function sendMessage(req: Request, res: Response) {
  const { id } = req.params;
  const { message } = req.body;
  const { username }: any = (<any> req).claim || {};

  if (!username) {
    return res.status(401).end();
  }

  if (!Types.ObjectId.isValid(id)) {
    return res.status(404).end();
  }

  if (typeof message !== 'string' || message.length < 1 || message.length > 500) {
    return res.status(400).end();
  }

  const user = await User.findOne({ username });
  const game = await Game.findById(id);

  if (!user || !game || !game.players.some(p => p.userId.toString() === user._id.toString())) {
    return res.status(401).end();
  }

  const { _id } = await Message.create({
    username: user.username,
    userId: user._id,
    osuUserId: user.osuUserId,
    gameId: new ObjectID(id),
    message: filter.clean(message),
  });

  cache.put('last-message-id', _id.toString());

  res.status(200).end();
}

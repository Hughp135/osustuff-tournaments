import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Game } from '../../../models/Game.model';
import { JoinGameRequest } from '../../../models/JoinGameRequest.model';
import { User } from '../../../models/User.model';
import { Message } from '../../../models/Message.model';

export async function sendMessage(req: Request, res: Response) {
  const { id } = req.params;
  const { requestId, message } = req.body;

  if (!Types.ObjectId.isValid(id)) {
    return res.status(404).end();
  }

  if (typeof message !== 'string' || message.length < 1 || message.length > 500) {
    return res.status(400).end();
  }

  const game = await Game.findById(id);

  if (!game) {
    return res.status(404).end();
  }

  const verifyRequest = await JoinGameRequest.findById(requestId);

  if (!verifyRequest) {
    return res.status(404).end();
  }

  if (!verifyRequest.verified || verifyRequest.gameId.toString() !== game._id.toString()) {
    return res.status(401).end();
  }

  const user = await User.findOne({ username: verifyRequest.username});

  if (!user) {
    return res.status(401).end();
  }

  await Message.create({
    username: user.username,
    userId: user._id,
    osuUserId: user.osuUserId,
    gameId: game._id,
    message,
  });

  res.status(200).end();
}
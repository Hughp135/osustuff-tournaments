import { Request, Response } from 'express';
import { Message } from '../../../models/Message.model';
import { ObjectID } from 'bson';

export async function getMessages(req: Request, res: Response) {
  const { id } = req.params;
  const { afterId } = req.query;

  if (!ObjectID.isValid(id)) {
    return res.status(404).end();
  }

  const filter: any = {
    gameId: id,
  };

  if (afterId && ObjectID.isValid(afterId)) {
    filter._id = { $gt: new ObjectID(afterId) };
  }

  const messages = await Message.find(filter)
    .select({
      userId: 0,
      updatedAt: 0,
      __v: 0,
    })
    .sort({ _id: -1 })
    .limit(100)
    .lean();

  res.json(messages);
}

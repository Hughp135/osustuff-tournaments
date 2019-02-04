import { Request, Response } from 'express';
import { Message } from '../../../models/Message.model';
import { ObjectID } from 'bson';
import { getDataOrCache, cache } from '../../../services/cache';

export async function getMessages(req: Request, res: Response) {
  const { id } = req.params;
  const { afterId } = req.query;

  if (!ObjectID.isValid(id)) {
    return res.status(404).end();
  }

  const lastMsg = cache.get('last-message-id');

  if (afterId === lastMsg) {
    // No new messages to retrieve
    return res.json([]);
  }

  const cacheKey = `get-messages-${id}-${afterId}`;
  const data = await getDataOrCache(cacheKey, 2000, async () => getData(id, afterId));

  res.json(data);
}

async function getData(id: string, afterId: string) {
  const filter: any = {
    gameId: id,
  };

  if (afterId && ObjectID.isValid(afterId)) {
    filter._id = { $gt: new ObjectID(afterId) };
  }

  return await Message.find(filter)
    .select({
      userId: 0,
      updatedAt: 0,
      __v: 0,
    })
    .sort({ _id: -1 })
    .limit(100)
    .lean();
}

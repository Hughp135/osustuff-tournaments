import { ObjectId } from 'bson';
import { Request, Response } from 'express';
import config from 'config';
import { Game } from '../../models/Game.model';

export async function deleteLobby(req: Request, res: Response) {
  if (req.body.pw !== config.get('ADMIN_PASS')) {
    return res.status(401).end();
  }

  if (!ObjectId.isValid(req.body.gameId)) {
    return res.status(400).end();
  }

  const game = await Game.findById(req.body.gameId);

  if (!game) {
    return res.status(404).end();
  }

  await Game.deleteOne({ _id: game._id });

  res.status(200).end();
}

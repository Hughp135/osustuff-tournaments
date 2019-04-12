import { ObjectId } from 'bson';
import { Request, Response } from 'express';
import { Game } from '../../models/Game.model';
import { User } from '../../models/User.model';

export async function deleteLobby(req: Request, res: Response) {
  const { username }: any = (<any>req).claim || {};

  if (!username) {
    return res.status(401).json({ error: 'You must be logged in.' });
  }

  const user = await User.findOne({ username });

  if (!user) {
    return res.status(401).json({ error: 'User not found.' });
  }

  if (!ObjectId.isValid(req.body.gameId)) {
    return res.status(400).end();
  }

  const game = await Game.findById(req.body.gameId);

  if (!game) {
    return res.status(404).end();
  }

  const canDelete =
    user.roles.includes('admin') ||
    (game.owner && game.owner.toString() === user._id.toString());

  if (!canDelete) {
    return res.status(401).json({ error: 'You do not have permissions to delete this lobby' });
  }

  await Game.deleteOne({ _id: game._id });

  res.status(200).end();
}

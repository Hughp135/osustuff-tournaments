import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { User } from '../../models/User.model';
import { Game } from '../../models/Game.model';

export async function getUsers(req: Request, res: Response) {
  const { id } = req.params;

  if (!Types.ObjectId.isValid(id)) {
    return res.status(404).end();
  }

  const game = await Game.findById(id)
    .select({
      players: 1,
    })
    .lean();

  if (!game) {
    return res.status(404).end();
  }

  const users = await User.find({
    _id: game.players.map((p: any) => p.userId),
  })
    .select({
      country: 1,
      ppRank: 1,
      osuUserId: 1,
      username: 1,
    })
    .lean();

  const players = game.players
    .sort((a: any, b: any) => b.alive - a.alive)
    .map((p: any) => ({
      ...p,
      ...users.find((u: any) => u._id.toString() === p.userId.toString()),
    }));

  res.json(players);
}

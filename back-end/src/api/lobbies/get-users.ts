import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { User } from '../../models/User.model';
import { Game } from '../../models/Game.model';
import { getDataOrCache } from '../../services/cache';

export async function getLobbyUsers(req: Request, res: Response) {
  const { id } = req.params;

  if (!Types.ObjectId.isValid(id)) {
    return res.status(404).end();
  }

  const players = await getDataOrCache(`get-lobby-users-${id}`, 5000, async () => await getData(id));

  if (!players) {
    return res.status(404).end();
  }

  res.json(players);
}

async function getData(id: string) {
  const game = await Game.findById(id)
    .select({
      players: 1,
    })
    .lean();

  if (!game) {
    return null;
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

  return game.players
    .sort((a: any, b: any) => b.alive - a.alive)
    .map((p: any) => ({
      ...p,
      ...users.find((u: any) => u._id.toString() === p.userId.toString()),
    }));
}

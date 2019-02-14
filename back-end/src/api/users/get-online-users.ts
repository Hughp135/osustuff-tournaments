import { Request, Response } from 'express';
import { cache } from '../../services/cache';

export async function getOnlineUsers(req: Request, res: Response) {
  res.json({ onlinePlayers: (<string[]>cache.get('online-players')).length});
}

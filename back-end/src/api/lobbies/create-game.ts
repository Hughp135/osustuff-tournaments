import { IBeatmap } from '../../models/Beatmap.model';
import { Request, Response } from 'express';
import { createScheduledGame } from '../../game/create-scheduled-game';
import { User } from '../../models/User.model';

export interface ICreateScheduledGameOptions {
  title: string;
  roundBeatmaps: Array<IBeatmap | undefined>;
  date: Date;
  minRank?: number;
  maxRank?: number;
  minPlayers: number;
  maxPlayers: number;
  description?: string;
}

export async function makeScheduledGame(req: Request, res: Response) {
  const { username }: any = (<any>req).claim || {};

  if (!username) {
    return res.status(401).end();
  }

  const user = await User.findOne({ username });

  if (!user || !user.roles || !user.roles.includes('creator')) {
    return res.status(401).end();
  }

  const {
    title,
    roundBeatmaps,
    date,
    minRank,
    maxRank,
    minPlayers,
    maxPlayers,
    description,
  }: ICreateScheduledGameOptions = req.body;

  if (!title || title.length < 5 || title.length > 70) {
    return res.status(400).json({
      error: 'The title must be set and be between 5 and 70 characters',
    });
  }

  if (!date) {
    return res.status(400).json({ error: 'A start date must be chosen' });
  }

  if (new Date(date) < new Date()) {
    return res.status(400).json({ error: 'Start date must be in the future' });
  }

  if (description && description.length > 1500) {
    return res.status(400).json({ error: 'Please keep the description to under 1500 characters' });
  }

  if (!roundBeatmaps) {
    return res.status(400);
  }

  if (!minPlayers || minPlayers < 4 || minPlayers > 100) {
    return res.status(400).json({
      error: 'The minimum number of players must be between 4 and 100',
    });
  }

  if (!maxPlayers || minPlayers < 4 || minPlayers > 500) {
    return res.status(400).json({
      error: 'The maximum number of players must be between 4 and 500',
    });
  }

  if (minRank && (minRank > 1000000 || minRank < 5)) {
    return res.status(400).json({
      error: 'Min rank must be between 50 and 1000000',
    });
  }

  if (maxRank && (maxRank < 50 && maxRank > 1000000)) {
    return res.status(400).json({
      error: 'Max rank must between 50 and 1000000',
    });
  }

  if (minRank && maxRank && minRank >= maxRank) {
    return res.status(400).json({
      error: 'The min rank must be lower than the max rank',
    });
  }

  try {
    const game = await createScheduledGame(req.body, user);

    return res.status(200).json({ gameId: game._id });
  } catch (e) {
    console.error('Failed to create game', e);
  }

  return res.status(500).json({ error: 'Failed to create game' });
}

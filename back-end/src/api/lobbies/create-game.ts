import { IBeatmap } from '../../models/Beatmap.model';
import { Request, Response } from 'express';
import { createScheduledGame } from '../../game/create-scheduled-game';
import { User } from '../../models/User.model';
import { logger } from '../../logger';

export interface ICreateScheduledGameOptions {
  title: string;
  roundBeatmaps: Array<IBeatmap | undefined>;
  nextStageStarts: Date;
  minRank?: number;
  maxRank?: number;
  minPlayers: number;
  maxPlayers: number;
  description?: string;
}

export async function makeScheduledGame(req: Request, res: Response) {
  const { username }: any = (<any>req).claim || {};

  if (!username) {
    return res.status(401).end({ error: 'You must be logged in' });
  }

  const user = await User.findOne({ username });

  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }

  const canCreate =
    user.roles.includes('creator') || user.roles.includes('admin');

  if (!canCreate) {
    return res
      .status(401)
      .json({ error: 'You do not have the permission to create lobbies' });
  }

  const error = validateGameRequestBody(req.body);

  if (error) {
    return res.status(400).json({ error });
  }

  try {
    const game = await createScheduledGame(req.body, user);

    return res.status(200).json({ gameId: game._id });
  } catch (e) {
    logger.error('Failed to create game', e);
  }

  return res.status(500).json({ error: 'Failed to create game' });
}

export function validateGameRequestBody(
  body: ICreateScheduledGameOptions,
): string | undefined {
  const {
    title,
    roundBeatmaps,
    nextStageStarts,
    minRank,
    maxRank,
    minPlayers,
    maxPlayers,
    description,
  } = body;

  if (!title || title.length < 5 || title.length > 70) {
    return 'The title must be set and be between 5 and 70 characters';
  }

  if (!nextStageStarts) {
    return 'A start date must be chosen';
  }

  if (new Date(nextStageStarts) < new Date()) {
    return 'Start date must be in the future';
  }

  if (description && description.length > 1500) {
    return 'Please keep the description to under 1500 characters';
  }

  if (!roundBeatmaps) {
    return 'Beatmaps must be set';
  }

  if (!minPlayers || minPlayers < 4 || minPlayers > 100) {
    return 'The minimum number of players must be between 4 and 100';
  }

  if (!maxPlayers || minPlayers < 4 || minPlayers > 500) {
    return 'The maximum number of players must be between 4 and 500';
  }

  if (minRank && (minRank > 1000000 || minRank < 5)) {
    return 'Min rank must be between 50 and 1000000';
  }

  if (maxRank && (maxRank < 50 && maxRank > 1000000)) {
    return 'Max rank must between 50 and 1000000';
  }

  if (minRank && maxRank && minRank >= maxRank) {
    return 'The min rank must be lower than the max rank';
  }
}

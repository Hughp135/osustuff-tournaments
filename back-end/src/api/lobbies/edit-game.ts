import { IGame } from './../../models/Game.model';
import { IBeatmap } from '../../models/Beatmap.model';
import { Request, Response } from 'express';
import { User } from '../../models/User.model';
import { validateGameRequestBody } from './create-game';
import { Game } from '../../models/Game.model';
import { fillUndefinedBeatmapsWithRandom } from '../../game/create-scheduled-game';
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
  password?: string;
}

export async function editLobby(req: Request, res: Response) {
  const { username }: any = (<any>req).claim || {};
  const { gameId }: any = req.params;

  if (!username) {
    return res.status(401).json({ error: 'You must be logged in.' });
  }

  const user = await User.findOne({ username });

  if (
    !user ||
    !user.roles ||
    !(user.roles.includes('creator') || user.roles.includes('admin'))
  ) {
    return res
      .status(401)
      .json({ error: 'User does not exist or have correct role to edit.' });
  }

  const game = await Game.findById(gameId);

  if (!game) {
    return res.status(404).end();
  }

  const canEdit =
    user.roles.includes('admin') ||
    (game.owner && game.owner.toString() === user._id.toString());
  if (!canEdit) {
    return res.status(401).json({ error: 'Only the owner or admins can edit' });
  }

  const error = validateGameRequestBody(req.body);

  if (error) {
    return res.status(400).json({ error });
  }

  const gameData: Partial<IGame> = {
    title: req.body.title,
    beatmaps: await fillUndefinedBeatmapsWithRandom(req.body.roundBeatmaps, req.body.gameMode),
    status: 'scheduled',
    nextStageStarts: req.body.nextStageStarts,
    minRank: req.body.minRank,
    maxRank: req.body.maxRank,
    owner: user._id,
    description: req.body.description,
    gameMode: req.body.gameMode,
  };

  if (req.body.password || req.body.password === '0') {
    gameData.password = req.body.password;
    gameData.hasPassword = !!req.body.password && req.body.password !== '0';
  }

  // Remove 'nextStageStarts' if lobby is not new/scheduled
  if (!['new', 'scheduled'].includes(game.status)) {
    delete gameData.nextStageStarts;
  }

  try {
    await Game.updateOne({ _id: gameId }, { $set: gameData });
    return res.json({ gameId });
  } catch (e) {
    logger.error('Failed to edit game!', e);
    return res.status(500).json({ error: 'Failed to create game' });
  }
}

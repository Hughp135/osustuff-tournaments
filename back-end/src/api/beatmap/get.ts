import { Request, Response } from 'express';
import { getBeatmapById } from '../../services/osu-api';

export async function getBeatmap(req: Request, res: Response) {
  const { beatmapId } = req.params;

  if (!beatmapId) {
    return res.status(400).end();
  }

  const beatmap = await getBeatmapById(beatmapId);

  res.json({ beatmap: beatmap || null });
}

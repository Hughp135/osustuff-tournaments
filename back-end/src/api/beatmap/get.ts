import { Request, Response } from 'express';
import { getBeatmapById } from '../../services/osu-api';

export async function getBeatmap(req: Request, res: Response) {
  const { beatmapId } = req.params;
  const { m } = req.query;

  if (!beatmapId) {
    return res.status(400).end();
  }

  if (m && !['0', '1', '2', '3'].includes(m)) {
    return res.status(400).end();
  }

  const beatmap = await getBeatmapById(beatmapId, m);

  res.json({ beatmap: beatmap || null });
}

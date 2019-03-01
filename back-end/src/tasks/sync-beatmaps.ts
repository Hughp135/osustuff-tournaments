import { getBeatmaps } from '../services/osu-api';
import got from 'got';
import { Beatmap } from '../models/Beatmap.model';
import { connectToMongo } from '../helpers/connect-to-mongo';
import { logger } from '../logger';

async function start() {
  await connectToMongo();

  const downloadAvailable: string[] = [];
  const downloadUnavailable: string[] = [];
  let date = new Date('2014-11-01');
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  console.time('start');

  while (date < lastMonth) {
    logger.info(`Getting beatmaps from date ${date}...`);
    const beatmaps = (await getBeatmaps(date)).sort(
      (a, b) =>
        new Date(b.approved_date).getTime() -
        new Date(a.approved_date).getTime(),
    );
    logger.info(`API returned ${beatmaps.length} beatmaps.`);
    const existingMaps: string[] = [];
    const added: string[] = [];

    for (const beatmap of beatmaps) {
      if (downloadUnavailable.includes(beatmap.beatmapset_id)) {
        logger.info(`Download unavailable for ${beatmap.beatmapset_id}.`);
        continue;
      }
      const existing = await Beatmap.findOne({
        beatmap_id: beatmap.beatmap_id,
      });
      if (existing) {
        existingMaps.push(beatmap.beatmap_id);
        continue;
      }

      await new Promise(res => setTimeout(res, 1500));

      try {
        // Check if beatmap is available for download. Will throw 404 if not
        await got.head(
          `https://osu.ppy.sh/beatmapsets/${beatmap.beatmapset_id}/download`,
          {},
        );
        // Add beatmap to database
        const newB = await Beatmap.create(beatmap);
        added.push(beatmap.beatmap_id);
        downloadAvailable.push(beatmap.beatmapset_id);
      } catch (e) {
        if (e.statusCode === 404) {
          // Unavailable to download
          logger.info(`Download not available for beatmap ${beatmap.beatmapset_id}.`);
          downloadUnavailable.push(beatmap.beatmapset_id);
        } else if (e.statusCode === 429) {
          logger.info('Timed out, waiting one minute...');
          console.timeEnd('start');
          await new Promise(res => setTimeout(res, 60000));
        } else {
          // Some unexpected error occured
          logger.info(`Failed to get beatmap ${beatmap.beatmapset_id}!`, e);
        }
      }

      logger.info(`Added ${added.length} beatmaps.`);
      logger.info(`${existingMaps.length} existing beatmaps.`);
    }

    const [lastBeatmap] = beatmaps.sort(
      (a, b) =>
        new Date(b.approved_date).getTime() -
        new Date(a.approved_date).getTime(),
    );
    date = new Date(lastBeatmap.approved_date);
    date.setMonth(date.getMonth() + 4);
  }

  logger.info(`Added ${downloadAvailable.length} beatmaps.`);
  logger.info(`${downloadUnavailable.length} beatmaps not available to download.`);
}

start().catch(e => logger.info(e));

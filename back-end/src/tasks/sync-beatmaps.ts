import { getBeatmaps } from '../services/osu-api';
import got from 'got';
import { Beatmap } from '../models/Beatmap.model';
import { connectToMongo } from '../helpers/connect-to-mongo';

async function start() {
  await connectToMongo();

  const downloadAvailable: string[] = [];
  const downloadUnavailable: string[] = [];
  let date = new Date('2014-11-01');
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  console.time('start');

  while (date < lastMonth) {
    console.info('getting beatmaps from date', date);
    const beatmaps = (await getBeatmaps(date)).sort(
      (a, b) =>
        new Date(b.approved_date).getTime() -
        new Date(a.approved_date).getTime(),
    );
    console.info('osu api beatmaps', beatmaps.length);
    const existingMaps: string[] = [];
    const added: string[] = [];

    for (const beatmap of beatmaps) {
      if (downloadUnavailable.includes(beatmap.beatmapset_id)) {
        console.info('dl unavailable', beatmap.beatmapset_id);
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
          console.info('Download not available', beatmap.beatmapset_id);
          downloadUnavailable.push(beatmap.beatmapset_id);
        } else if (e.statusCode === 429) {
          console.info('Timed out, waiting a minute');
          console.timeEnd('start');
          await new Promise(res => setTimeout(res, 60000));
        } else {
          // Some unexpected error occured
          console.info('failed', beatmap.beatmapset_id, e);
        }
      }

      console.info('added', added.length);
      console.info('already added', existingMaps.length);
    }

    const [lastBeatmap] = beatmaps.sort(
      (a, b) =>
        new Date(b.approved_date).getTime() -
        new Date(a.approved_date).getTime(),
    );
    date = new Date(lastBeatmap.approved_date);
    date.setMonth(date.getMonth() + 4);
  }

  console.info('beatmaps added', downloadAvailable.length);
  console.info('beatmaps not available to download', downloadUnavailable.length);
}

start().catch(e => console.info(e));

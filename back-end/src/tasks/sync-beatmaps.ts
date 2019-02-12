import mongoose from 'mongoose';
import config from 'config';
import { getBeatmaps } from '../services/osu-api';
import got from 'got';
import { Beatmap } from '../models/Beatmap.model';

async function start() {
  await mongoose.connect(
    'mongodb://127.0.0.1:' + config.get('DB_PORT') + '/osu-br',
    {
      useNewUrlParser: true,
    },
  );

  const downloadAvailable: string[] = [];
  const downloadUnavailable: string[] = [];
  let date = new Date('2013-01-01');
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  console.time('start');

  while (date < lastMonth) {
    console.log('getting beatmaps from date', date);
    const beatmaps = (await getBeatmaps(date)).sort(
      (a, b) =>
        new Date(b.approved_date).getTime() -
        new Date(a.approved_date).getTime(),
    );
    console.log('osu api beatmaps', beatmaps.length);
    const existingMaps: string[] = [];
    const added: string[] = [];

    for (const beatmap of beatmaps) {
      if (downloadUnavailable.includes(beatmap.beatmapset_id)) {
        console.log('dl unavailable', beatmap.beatmapset_id);
        continue;
      }
      const existing = await Beatmap.findOne({
        beatmap_id: beatmap.beatmap_id,
      });
      if (existing) {
        existingMaps.push(beatmap.beatmap_id);
        continue;
      }

      await new Promise(res => setTimeout(res, 1000));

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
          console.log('Download not available', beatmap.beatmapset_id);
          downloadUnavailable.push(beatmap.beatmapset_id);
        } else if (e.statusCode === 429) {
          console.log('Timed out, waiting a minute');
          console.timeEnd('start');
          await new Promise(res => setTimeout(res, 60000));
        } else {
          // Some unexpected error occured
          console.log('failed', beatmap.beatmapset_id, e);
        }
      }

      console.log('added', added.length);
      console.log('already added', existingMaps.length);
    }

    const [lastBeatmap] = beatmaps.sort(
      (a, b) =>
        new Date(b.approved_date).getTime() -
        new Date(a.approved_date).getTime(),
    );
    date = new Date(lastBeatmap.approved_date);
  }

  console.log('beatmaps added', downloadAvailable.length);
  console.log('beatmaps not available to download', downloadUnavailable.length);
}

start().catch(e => console.log(e));

import config from 'config';
import got from 'got';
import { IBeatmap } from '../models/Beatmap.model';
import Bottleneck from 'bottleneck';

const limiter = new Bottleneck({
  maxConcurrent: 100,
  minTime: 50, // time delay between each request
  highWater: 5000, // max queued requests
  reservoir: 1200, // limit per minute
  reservoirRefreshAmount: 1200, // limit per minute
  reservoirRefreshInterval: 60 * 1000, // time to reset
});
const OSU_API_KEY = config.get('OSU_API_KEY');
const BASE_URL = 'https://osu.ppy.sh/api/';

async function request(
  endpoint: 'get_user' | 'get_user_recent' | 'get_beatmaps',
  query: { [key: string]: string },
): Promise<any> {
  const requestUrl = `${BASE_URL}${endpoint}`;

  try {
    const response = await limiter.schedule(
      {
        priority: endpoint === 'get_user_recent' ? 6 : 5, // score checking is lowest priority
      },
      async () =>
        await got.get(requestUrl, {
          query: {
            k: OSU_API_KEY,
            ...query,
          },
          json: true,
        }),
    );
    console.log('got Response from', requestUrl);

    return response.body;
  } catch (e) {
    throw new Error('Request to Osu API failed ' + JSON.stringify(query) + e);
  }
}

export async function getUser(username: string) {
  return (await (<any> request('get_user', {
    u: username,
    type: 'string',
    m: '0', // osu game mode
  })))[0];
}

export async function getUserRecent(username: string) {
  return await request('get_user_recent', {
    u: username,
    type: 'string',
  });
}

export async function getBeatmaps(from: Date, limit?: number): Promise<IBeatmap[]> {
  return await request('get_beatmaps', {
    m: '0',
    since: from.toISOString(),
    limit: limit ? limit.toString() : '500',
  });
}

export async function getRecentBeatmaps(): Promise<IBeatmap[]> {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  const date2 = new Date();
  date2.setFullYear(date2.getFullYear() - Math.floor(Math.random() * 4) + 1);
  const date3 = new Date();
  date.setMonth(date3.getMonth() - 6);

  const beatmaps1 = await request('get_beatmaps', {
    m: '0',
    since: date.toISOString(),
  });
  const beatmaps2 = await request('get_beatmaps', {
    m: '0',
    since: date2.toISOString(),
  });
  const beatmaps3 = await request('get_beatmaps', {
    m: '0',
    since: date3.toISOString(),
  });

  const allBeatmaps = beatmaps1;
  allBeatmaps.push(...beatmaps2);
  allBeatmaps.push(...beatmaps3);

  return allBeatmaps;
}

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
const TEST_MODE = config.get('TEST_MODE');

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

    return response.body;
  } catch (e) {
    throw new Error('Request to Osu API failed ' + JSON.stringify(query) + e);
  }
}

export async function getUser(
  username: string,
  gameMode: '0' | '1' | '2' | '3' = '0',
) {
  return (await (<any>request('get_user', {
      u: username,
      type: 'string',
      m: gameMode, // osu game mode
    })))[0];
}

export async function getUserRecent(
  username: string,
  mode: '0' | '1' | '2' | '3' = '0',
) {
  return await request('get_user_recent', {
    u: username,
    type: 'string',
    m: mode,
  });
}

export async function getBeatmaps(
  from: Date,
  limit?: number,
  mode?: '0' | '1' | '2' | '3',
): Promise<IBeatmap[]> {
  return await request('get_beatmaps', {
    m: mode || '0',
    since: from.toISOString(),
    limit: limit ? limit.toString() : '500',
  });
}
export async function getBeatmapById(beatmapId: string): Promise<IBeatmap[]> {
  const query: { [key: string]: string } = {
    m: '0',
    b: beatmapId,
  };

  return (await request('get_beatmaps', query))[0];
}

export async function getRecentBeatmaps(
  mode?: '0' | '1' | '2' | '3',
): Promise<IBeatmap[]> {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  const date2 = new Date();
  date2.setFullYear(date2.getFullYear() - Math.floor(Math.random() * 4) + 1);
  const date3 = new Date();
  date.setMonth(date3.getMonth() - 6);
  const date4 = new Date();
  date.setMonth(date4.getMonth() - 12);
  const date5 = new Date();
  date.setMonth(date5.getMonth() - 18);
  const m = mode || '0';

  const beatmaps1 = await request('get_beatmaps', {
    m,
    since: date.toISOString(),
  });
  const allBeatmaps = beatmaps1;

  if (!TEST_MODE) {
    const beatmaps2 = await request('get_beatmaps', {
      m,
      since: date2.toISOString(),
    });
    const beatmaps3 = await request('get_beatmaps', {
      m,
      since: date3.toISOString(),
    });
    allBeatmaps.push(...beatmaps2);
    allBeatmaps.push(...beatmaps3);
    if (mode === '3') {
      const beatmaps4 = await request('get_beatmaps', {
        m,
        since: date4.toISOString(),
      });
      const beatmaps5 = await request('get_beatmaps', {
        m,
        since: date5.toISOString(),
      });
      allBeatmaps.push(...beatmaps4);
      allBeatmaps.push(...beatmaps5);
    }
  }

  return allBeatmaps;
}

import config from 'config';
import got from 'got';
import { IBeatmap } from '../models/Round.model';

const OSU_API_KEY = config.get('OSU_API_KEY');
const BASE_URL = 'https://osu.ppy.sh/api/';

async function request(
  endpoint: 'get_user' | 'get_user_recent' | 'get_beatmaps',
  query: { [key: string]: string },
): Promise<any> {
  const requestUrl = `${BASE_URL}${endpoint}`;

  try {
    const response = await got.get(requestUrl, {
      query: {
        k: OSU_API_KEY,
        ...query,
      },
      json: true,
    });

    return response.body;
  } catch (e) {
    throw new Error('Request to Osu API failed ' + JSON.stringify(query) + e);
  }
}

export async function getUser(username: string) {
  return (await (<any> request('get_user', {
    u: username,
  })))[0];
}

export async function getUserRecent(username: string) {
  return await request('get_user_recent', {
    u: username,
    type: 'string',
  });
}

export async function getRecentBeatmaps(): Promise<IBeatmap[]> {
  const date = new Date();
  date.setDate(date.getDate() - 14);

  return await request('get_beatmaps', {
    m: '0',
    since: date.toISOString(),
  });
}

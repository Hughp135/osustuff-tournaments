import config from 'config';
import got from 'got';

const OSU_API_KEY = config.get('OSU_API_KEY');
const BASE_URL = 'https://osu.ppy.sh/api/';

async function request(
  endpoint: 'get_user' | 'get_user_recent',
  query: { [key: string]: string },
): Promise<any> {
  const queryString = Object.entries(query)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
  const requestUrl = `${BASE_URL}${endpoint}?k=${OSU_API_KEY}&${queryString}`;

  try {
    const response = (await got.get(requestUrl)).body;

    try {
      return JSON.parse(response);
    } catch (e) {
      throw new Error('Failed to parse Osu API response ' + queryString + ', response ' + response);
    }
  } catch (e) {
    throw new Error('Request to Osu API failed ' + queryString + e);
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
  });
}

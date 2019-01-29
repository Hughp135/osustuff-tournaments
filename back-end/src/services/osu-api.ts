import config from 'config';
import got from 'got';

const OSU_API_KEY = config.get('OSU_API_KEY');
const BASE_URL = 'https://osu.ppy.sh/api/';

async function request(
  endpoint: 'get_user' | 'get_user_recent',
  query: { [key: string]: string },
): Promise<any> {
  const requestUrl = `${BASE_URL}${endpoint}`;

  try {
    const response = (await got.get(requestUrl, {
      query: {
        k: OSU_API_KEY,
        ...query,
      },
    })).body;

    try {
      return JSON.parse(response);
    } catch (e) {
      throw new Error(
        'Failed to parse Osu API response ' +
          endpoint +
          JSON.stringify(query) +
          ', response ' +
          response,
      );
    }
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

import { Request, Response } from 'express';
import { User } from '../../models/User.model';
import got from 'got';
import config from 'config';

export async function twitchVerify(req: Request, res: Response) {
  const { username }: any = (<any>req).claim || {};

  if (!username) {
    return res.status(401).json({ error: 'You must be logged in' });
  }

  const user = await User.findOne({ username });

  if (!user || user.banned) {
    return res.status(401).json({ error: 'User is banned or does not exist' });
  }

  const { code } = req.query;

  if (!code) {
    return res.status(401).json({ error: 'No twitch code was supplied' });
  }

  try {
    const tokenResponse = await got.post(`https://id.twitch.tv/oauth2/token`, {
      json: true,
      query: {
        client_id: config.get('TWITCH_CLIENT_ID'),
        client_secret: config.get('TWITCH_SECRET'),
        code,
        grant_type: 'authorization_code',
        redirect_uri: config.get('TWITCH_REDIRECT'),
      },
    });
    if (!tokenResponse.body || !tokenResponse.body.access_token) {
      console.error(
        'Twitch oauth response did not contain a token. Body:',
        tokenResponse.body,
      );
      return res
        .status(401)
        .json({ error: 'Failed to verify code from twitch' });
    }

    const userResponse = await got.get('https://api.twitch.tv/helix/users', {
      json: true,
      headers: {
        Authorization: `Bearer ${tokenResponse.body.access_token}`,
      },
    });

    if (!userResponse.body || !userResponse.body.data) {
      return res.status(404).json({ error: 'Twitch user data not found' });
    }

    const twitchUser = userResponse.body.data[0];

    user.twitch = { loginName: twitchUser.login, userId: twitchUser.id };
    await user.save();
  } catch (e) {
    console.error('Failed to verify twitch', e.body || e);

    return res.status(400).json({ error: 'Failed to verify twitch oauth' });
  }

  res.redirect('/user/' + user.username);
}

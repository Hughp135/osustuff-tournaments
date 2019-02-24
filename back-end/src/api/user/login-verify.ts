import { Role, User } from './../../models/User.model';
import { Request, Response } from 'express';
import got from 'got';
import config from 'config';
import { updateOrCreateUser } from '../../models/User.model';
import { createJWT } from '../auth/jwt';
import { logger } from '../../logger';

const OSU_OAUTH_ID = config.get('OSU_OAUTH_ID');
const OSU_OAUTH_SECRET = config.get('OSU_OAUTH_SECRET');
const OSU_OAUTH_REDIRECT = config.get('OSU_OAUTH_REDIRECT');
const TEST_MODE = config.get('TEST_MODE');

export async function loginVerify(req: Request, res: Response) {
  const { code, state } = req.query;

  if (!code) {
    res.status(401).end();
  }

  try {
    const loginResult = await got.post('https://osu.ppy.sh/oauth/token', {
      form: true,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: {
        grant_type: 'authorization_code',
        client_id: OSU_OAUTH_ID,
        client_secret: OSU_OAUTH_SECRET,
        redirect_uri: OSU_OAUTH_REDIRECT,
        code,
      },
      json: true,
    });

    const { body } = await got.get('https://osu.ppy.sh/api/v2/me', {
      headers: {
        Authorization: 'Bearer ' + loginResult.body.access_token,
      },
      json: true,
    });

    if (!body.id || !body.username || !body.country || !body.statistics) {
      logger.error('/api/v2/me didn\'t have necessary data!', body);
      throw new Error();
    }

    const bannedPlayer = await User.findOne({ osuUserId: body.id, banned: true });

    if (bannedPlayer) {
      return res.status(401).end();
    }

    const roles: Role[] | undefined = TEST_MODE ? ['creator', 'admin', 'moderator'] : undefined;

    await updateOrCreateUser(
      {
        user_id: body.id,
        username: body.username,
        country: body.country.code,
        pp_rank: body.statistics.rank.global || 0,
        pp_country_rank: body.statistics.rank.country || 0,
      },
      roles,
    );

    const token = createJWT({
      username: body.username,
      user_id: body.id,
    });

    res.cookie('jwt_token', token, {
      maxAge: 2592000000, // 30 days in ms
      httpOnly: true,
    });

    if (state) {
      try {
        const { gameId } = JSON.parse(state);

        return res.redirect(`/lobbies/${gameId}?autoJoin=true`);
      } catch (e) {
        logger.error('Failed to parse OAuth state!', state);
      }
    }

    res.redirect('/lobbies');
  } catch (e) {
    logger.error('Failed to verify OAuth request!', e);
    res.status(400).end();
  }
}

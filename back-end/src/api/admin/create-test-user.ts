import { Request, Response } from 'express';
import config from 'config';
import { updateOrCreateUser } from '../../models/User.model';
import { Achievement } from '../../models/Achievement.model';
import { giveAchievement } from '../../achievements/give-achievement';

export async function createTestUser(req: Request, res: Response) {
  if (req.body.pw !== config.get('ADMIN_PASS') ||
    !config.get('TEST_MODE')) {
    return res.status(401).end();
  }

  const user = await updateOrCreateUser({
    pp_rank: '1',
    user_id: '3',
    pp_country_rank: '1',
    username: 'BanchoBot',
    country: 'SH',
  });

  user.update({
    gamesPlayed: 100,
    wins: 100,
    rating: {
      mu: 10003,
      sigma: 1,
      weighted: 10000,
    },
  });

  const achievements = await Achievement.find({});

  for (const achievement of achievements) {
    await giveAchievement(user, achievement);
  }

  res.status(200).end();
}

import { IUser } from './../../models/User.model';
import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { User } from '../../models/User.model';
import { Game } from '../../models/Game.model';
import { getDataOrCache } from '../../services/cache';
import got from 'got';
import config from 'config';

export async function getLobbyUsers(req: Request, res: Response) {
  const { id } = req.params;

  if (!Types.ObjectId.isValid(id)) {
    return res.status(404).end();
  }

  const players = await getDataOrCache(
    `get-lobby-users-${id}`,
    5000,
    async () => await getData(id),
  );

  if (!players) {
    return res.status(404).end();
  }

  res.json(players);
}

async function getData(id: string) {
  const game = await Game.findById(id)
    .select({
      players: 1,
    })
    .lean();

  if (!game) {
    return null;
  }

  const users = await User.find({
    _id: game.players.map((p: any) => p.userId),
  })
    .select({
      country: 1,
      ppRank: 1,
      osuUserId: 1,
      username: 1,
      wins: 1,
      gamesPlayed: 1,
      percentiles: 1,
      rating: 1,
      twitch: 1,
    })
    .lean();

  const usersWithTwitch = users.filter((u: IUser) => u.twitch);

  if (usersWithTwitch.length) {
    const queryString = usersWithTwitch
      .map((u: any) => u.twitch.loginName)
      .join(`&user_login=`);

    try {
      const { body } = await got.get(
        `https://api.twitch.tv/helix/streams?user_login=${queryString}`,
        {
          json: true,
          headers: {
            'Client-ID': config.get('TWITCH_CLIENT_ID'),
          },
          timeout: 2000, // don't delay requests too long for this
        },
      );

      const channels = body.data;
      if (channels && channels.length) {
        channels.forEach((channel: any) => {
          const user = usersWithTwitch.find(
            (u: IUser) => u.twitch && u.twitch.userId === channel.user_id,
          );
          if (user) {
            user.isStreaming = true;
          }
        });
      }
    } catch (e) {
      console.error('Failed to get channels from twitch', e.body || e);
    }
  }

  return game.players
    .sort((a: any, b: any) => b.alive - a.alive)
    .map((p: any) => {
      const user = users.find(
        (u: any) => u._id.toString() === p.userId.toString(),
      );
      if (!user) {
        console.error('No user found for player', p.username, 'Game', game._id);
      }
      if (user && user.twitch) {
        delete user.twitch.userId;
      }
      return {
        ...p,
        ...user,
      };
    });
}

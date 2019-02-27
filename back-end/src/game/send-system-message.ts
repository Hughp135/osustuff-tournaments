import { IGame } from '../models/Game.model';
import { IMessage, Message } from '../models/Message.model';
import got from 'got';
import config from 'config';

export async function sendSystemMessage(
  game: IGame,
  message: string,
): Promise<IMessage> {
  const msg = await Message.create({
    username: 'System',
    userId: 967760000000,
    osuUserId: 0,
    gameId: game._id,
    message,
  });

  delete msg.userId;
  delete msg.__v;

  if (process.env.NODE_ENV !== 'test') {
    await got.post(
      `http://localhost:${config.get('SOCKET_PORT')}/system-message`,
      {
        json: true,
        body: {
          message: msg,
        },
      },
    );
  }

  return msg;
}

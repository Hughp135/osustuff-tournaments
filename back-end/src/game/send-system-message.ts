import { IGame } from '../models/Game.model';
import { IMessage, Message } from '../models/Message.model';

export async function sendSystemMessage(game: IGame, message: string): Promise<IMessage> {
  return await Message.create({
    username: 'System',
    userId: 967760000000,
    osuUserId: 0,
    gameId: game._id,
    message,
  });
}

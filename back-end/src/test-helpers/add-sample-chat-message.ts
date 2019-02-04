import { IGame } from '../models/Game.model';
import { arrayRandVal } from '../game/create-game';
import { Message } from '../models/Message.model';
import faker from 'faker';
import { cache } from '../services/cache';

export async function addSampleChatMessage(game: IGame) {
  if (Math.random() < 0.85 || !game.players.length) {
    return;
  }

  const player = arrayRandVal(game.players);

  const { _id } = await Message.create({
    username: player.username,
    osuUserId: player.osuUserId,
    gameId: game._id,
    userId: player.userId,
    message: faker.lorem.sentence(),
  });

  cache.put('last-message-id', _id.toString());
}

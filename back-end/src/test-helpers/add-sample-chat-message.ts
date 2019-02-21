import { IGame } from '../models/Game.model';
import { Message } from '../models/Message.model';
import faker from 'faker';
import { cache } from '../services/cache';
import { randomFromArray } from '../helpers/random-from-array';

export async function addSampleChatMessage(game: IGame) {
  if (Math.random() < 0.85 || !game.players.length) {
    return;
  }

  const player = randomFromArray(game.players);

  const { _id } = await Message.create({
    username: player.username,
    osuUserId: player.osuUserId,
    gameId: game._id,
    userId: player.userId,
    message: faker.lorem.sentence(),
  });

  cache.put('last-message-id', _id.toString());
}

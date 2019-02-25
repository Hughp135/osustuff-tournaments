import { IGame } from '../models/Game.model';
import { Message } from '../models/Message.model';
import faker from 'faker';
import { cache } from '../services/cache';
import { randomFromArray } from '../helpers/random-from-array';
import { getRandomEmoji } from '../helpers/get-random-emoji';
import { getRandomHtml } from '../helpers/get-random-html';

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
    message: randomFromArray([
      faker.lorem.sentence() + ' ' + getRandomEmoji(),
      faker.lorem.sentence(),
      getRandomEmoji(),
      getRandomHtml(),
    ]),
  });

  cache.put('last-message-id', _id.toString());
}

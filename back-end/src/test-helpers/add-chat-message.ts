import { IGame } from '../models/Game.model';
import { arrayRandVal } from '../game/create-game';
import { Message } from '../models/Message.model';
import faker from 'faker';

export async function addSampleChatMessage(game: IGame) {
  if (Math.random() < 0.85 || !game.players.length) {
    return;
  }

  const player = arrayRandVal(game.players);

  await Message.create({
    username: player.username,
    osuUserId: player.osuUserId,
    gameId: game._id,
    userId: player.userId,
    message: faker.lorem.sentence(),
  });
}

import { ObjectID } from 'bson';
import { Server } from 'socket.io';
import { Message } from './../../models/Message.model';
import { User } from '../../models/User.model';
import { Game } from '../../models/Game.model';
import { logger } from '../../logger';
const Filter = require('bad-words');

const filter = new Filter();
filter.addWords('rape', 'mongoloid');
filter.removeWords('god', 'damn');

interface INewMessage {
  message: string;
  gameId: string;
}

const recentMessages: { [key: string]: number } = {};

export function sendMessage(io: Server) {
  io.on('connection', (socket: any) => {
    socket.on('send-message', async (request: INewMessage) => {
      const username = socket.claim.username;
      if (!username) {
        logger.error('No username in send message claim!', socket.claim);
        return;
      }
      if (request.message.length < 1 || request.message.length > 500) {
        socket.emit('soft-error', 'Invalid message length');
        return;
      }

      const user = await User.findOne({ username });
      if (!user) {
        logger.error(`No user found with username ${username}!`);
        return;
      }

      const game = await Game.findById(request.gameId);

      if (!game) {
        logger.error(`No game found with ID ${request.gameId}!`);
        return;
      }

      const player = game.players.find(
        p => p.userId.toString() === user._id.toString(),
      );

      if (!player) {
        logger.error(`(game id: ${game.id}) No player found with user id ${user.id}!`);
        return;
      }

      if (
        player.kicked &&
        !user.roles.includes('moderator') &&
        !user.roles.includes('admin')
      ) {
        logger.warn(`(game id: ${game.id}) Player with user id ${user.id} was kicked and tried to send message!`);
        return;
      }

      const date = new Date();
      date.setSeconds(date.getSeconds() - 10);

      if (recentMessages[user.username] > 5) {
        return;
      }

      const message = await Message.create({
        username: user.username,
        userId: user._id,
        osuUserId: user.osuUserId,
        gameId: new ObjectID(request.gameId),
        message: filter.clean(request.message),
      });

      recentMessages[user.username] = (recentMessages[user.username] || 0) + 1;
      setTimeout(() => {
        recentMessages[user.username] =
          (recentMessages[user.username] || 1) - 1;
      }, 10000);

      delete message.userId;

      io.in(`lobby-${request.gameId}`).emit('chat-message', message);
    });
  });
}

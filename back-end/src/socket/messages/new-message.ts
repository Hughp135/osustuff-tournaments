import { ObjectID } from 'bson';
import { Server } from 'socket.io';
import {  Message } from './../../models/Message.model';
import { User } from '../../models/User.model';
import { Game } from '../../models/Game.model';
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
        console.error('invalid osuUserId', socket.claim.user_id);
        return;
      }
      if (request.message.length < 1 || request.message.length > 500) {
        socket.emit('soft-error', 'Invalid message length');
        return;
      }

      const user = await User.findOne({ username });
      if (!user) {
        console.error('user not found with username', username);
        return;
      }

      const game = await Game.findById(request.gameId);

      if (!game) {
        console.error('game not found', request.gameId);
        return;
      }

      const player = game.players.find(
        p => p.userId.toString() === user._id.toString(),
      );

      if (!player || player.kicked) {
        console.error('player not found/kicked', player);
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
        recentMessages[user.username] = (recentMessages[user.username] || 1) - 1;
      }, 10000);

      delete message.userId;

      io.in(`lobby-${request.gameId}`).emit('chat-message', message);
    });
  });
}

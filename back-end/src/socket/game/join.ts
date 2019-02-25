import { Server, Socket } from 'socket.io';
import { Types } from 'mongoose';
import { User } from '../../models/User.model';
import { Game } from '../../models/Game.model';
import { getGamePayload } from '../../api/lobbies/get';
import { getGamePlayers } from '../../api/lobbies/get-users';

export function joinLobby(io: Server) {
  io.on('connection', async (socket: Socket) => {
    socket.on('join-game', async (gameId: string) => {
      console.log('user joined game', gameId);
      if (!Types.ObjectId.isValid(gameId)) {
        socket.emit('soft-error', 'Invalid channel ID');
        console.error('invalid id', gameId);
        return;
      }

      const username = (<any>socket).claim.username;
      if (!username) {
        console.error('invalid osuUserId', (<any>socket).claim.user_id);
        return;
      }

      const user = await User.findOne({ username });
      if (!user) {
        console.error('user not found with username', username);
        return;
      }
      const game = await Game.findById(gameId);

      if (!game) {
        console.error('game not found', gameId);
        return;
      }

      socket.join(`lobby-${gameId}`);
      const gamePayload = await getGamePayload(gameId);
      socket.emit('game-updated', gamePayload);
    });
  });
}

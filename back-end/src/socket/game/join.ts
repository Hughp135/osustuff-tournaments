import { Server, Socket } from 'socket.io';
import { Types } from 'mongoose';
import { Game } from '../../models/Game.model';
import { getGamePayload } from '../../api/lobbies/get';
import { getGamePlayers } from '../../api/lobbies/get-users';

export function joinLobby(io: Server) {
  io.on('connection', async (socket: Socket) => {
    socket.on('join-game', async (gameId: string) => {
      console.info('user joining game room', gameId);
      if (!Types.ObjectId.isValid(gameId)) {
        socket.emit('soft-error', 'Invalid channel ID');
        console.error('invalid id', gameId);
        return;
      }

      const game = await Game.findById(gameId);

      if (!game) {
        console.error('game not found', gameId);
        return;
      }

      Object.values(socket.rooms).forEach(room => {
        socket.leave(room);
      });

      socket.join(`lobby-${gameId}`);

      const gamePayload = await getGamePayload(gameId);
      socket.emit('game-updated', gamePayload);

      const players = await getGamePlayers(game);
      socket.emit('players-updated', {
        players: JSON.stringify(players),
        gameId,
      });
    });
  });
}

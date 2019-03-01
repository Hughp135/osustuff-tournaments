import { Server, Socket } from 'socket.io';
import { Types } from 'mongoose';
import { Game } from '../../models/Game.model';
import { getGamePayload } from '../../api/lobbies/get';
import { getGamePlayers } from '../../api/lobbies/get-users';
import { logger } from '../../logger';

export function joinLobby(io: Server) {
  io.on('connection', async (socket: Socket) => {
    socket.on('join-game', async (gameId: string) => {
      logger.info(`(game id: ${gameId}) User joining game room.`);
      if (!Types.ObjectId.isValid(gameId)) {
        socket.emit('soft-error', 'Invalid channel ID');
        logger.error(`(game id: ${gameId}) Invalid game ID!`);
        return;
      }

      const game = await Game.findById(gameId);

      if (!game) {
        logger.error(`(game id: ${gameId}) No game found!`);
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

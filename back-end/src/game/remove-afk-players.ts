import { IGame } from '../models/Game.model';
import { cache } from '../services/cache';
import { User } from '../models/User.model';
import { sendSystemMessage } from './send-system-message';
import config from 'config';
import { logger } from '../logger';
import { sendUpdatePlayersRequest } from './players/update-players';

const REMOVE_AFK_PLAYERS = config.get('REMOVE_AFK_PLAYERS');

export async function removeAfkPlayers(game: IGame) {
  if (!REMOVE_AFK_PLAYERS) {
    return;
  }

  const afkPlayers = game.players.filter(p => {
    return !cache.get(`user-active-${p.userId}`);
  });
  const activePlayers = game.players.filter(p => {
    return !!cache.get(`user-active-${p.userId}`);
  });

  for (const player of afkPlayers) {
    logger.info(`(game id: ${game._id.toHexString()}) Removing AFK player ${player.username} (id: ${player.userId})`);
    await User.updateOne(
      { _id: player.userId },
      { $set: { currentGame: undefined } },
    );
    await sendSystemMessage(
      game,
      `${player.username} has been removed from the lobby after 60 seconds of inactivity.`,
    );

    await sendUpdatePlayersRequest(game);
  }

  if (afkPlayers.length > 0) {
    game.players = activePlayers;

    await game.save();
  }
}

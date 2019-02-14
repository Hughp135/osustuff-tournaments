import { IGame } from '../models/Game.model';
import { cache } from '../services/cache';
import { User } from '../models/User.model';
import { sendSystemMessage } from './send-system-message';

export async function removeAfkPlayers(game: IGame) {
  const afkPlayers = game.players.filter(p => {
    return !cache.get(`user-active-${p.userId}`);
  });
  const activePlayers = game.players.filter(p => {
    return !!cache.get(`user-active-${p.userId}`);
  });

  console.log('active', activePlayers.length, 'inactive', afkPlayers.length);

  for (const player of afkPlayers) {
    console.log('removing afk player', player.username);
    await User.updateOne(
      { _id: player.userId },
      { $set: { currentGame: undefined } },
    );
    await sendSystemMessage(
      game,
      `${player.username} has been removed from the lobby after 60 seconds of inactivity.`,
    );
  }

  if (afkPlayers.length > 0) {
    game.players = activePlayers;

    await game.save();
  }
}

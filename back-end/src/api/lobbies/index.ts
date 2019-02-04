import { Game } from '../../models/Game.model';
import { getDataOrCache } from '../../services/cache';

export async function getLobbies() {
  const cacheKey = `get-lobbies`;
  return await getDataOrCache(cacheKey, 5000, async () => await getGames());
}

async function getGames() {
  const games = await Game.find({})
    .sort({ _id: -1 })
    .lean();

  return games.map((game: any) => {
    game.playerCount = game.players.length;
    game.players = undefined;
    const secondsToStart =
      game.status === 'new' && game.nextStageStarts
        ? (game.nextStageStarts.getTime() - Date.now()) / 1000
        : undefined;
    game.startsAt = secondsToStart;
    game.timeSinceCreated = (game.createdAt.getTime() - Date.now()) / 1000;

    return game;
  });
}

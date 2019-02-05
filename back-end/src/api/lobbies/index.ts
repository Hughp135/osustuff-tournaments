import { Game } from '../../models/Game.model';
import { getDataOrCache } from '../../services/cache';
import { Request, Response } from 'express';

export async function getLobbies(req: Request, res: Response) {
  const cacheKey = `get-lobbies`;
  const data = await getDataOrCache(cacheKey, 5000, async () => await getGames());

  res.json(data);
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

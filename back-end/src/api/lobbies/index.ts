import { Game } from '../../models/Game.model';
import { getDataOrCache } from '../../services/cache';
import { Request, Response } from 'express';

export async function getLobbies(req: Request, res: Response) {
  const cacheKey = `get-lobbies`;
  const data = await getDataOrCache(
    cacheKey,
    5000,
    async () => await getGames(),
  );

  res.json(data);
}

async function getGames() {
  const activeGames = await Game.find({ status: { $nin: ['scheduled', 'complete'] } })
    .sort({ _id: -1 })
    .limit(10)
    .lean();

  const scheduledGames = await Game.find({ status: 'scheduled' })
    .sort({ nextStageStarts: -1 })
    .limit(3)
    .lean();

  const completedGames = await Game.find({ status: 'complete' })
  .sort({ _id: -1 })
  .limit(12)
  .lean();

  const games = [
    ...activeGames,
    ...scheduledGames,
    ...completedGames,
  ];

  return games.map((game: any) => {
    game.playerCount = game.players.length;
    game.players = undefined;
    const secondsToStart =
      ['new', 'scheduled'].includes(game.status) && game.nextStageStarts
        ? (game.nextStageStarts.getTime() - Date.now()) / 1000
        : undefined;
    game.startsAt = secondsToStart;
    game.timeSinceCreated = (game.createdAt.getTime() - Date.now()) / 1000;

    return game;
  });
}

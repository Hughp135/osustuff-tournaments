import { Game } from '../../models/Game.model';

export async function getLobbies() {
  const games = await Game.find({})
    .sort({ _id: -1 })
    .lean();

  const transformed = games.map((game: any) => {
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

  return transformed;
}

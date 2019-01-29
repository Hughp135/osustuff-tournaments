import { Game, IGame } from '../models/Game.model';

export async function createGame(): Promise<IGame> {
  const game = await Game.create({});

  return game;
}

import { Game } from '../../models/Game.model';

export async function getLobbies() {
  return await Game.find({}).select({ players: 0 });
}

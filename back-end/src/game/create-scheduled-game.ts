import { IUser } from './../models/User.model';
import { ICreateScheduledGameOptions } from '../api/lobbies/create-game';
import { Game, IGame } from '../models/Game.model';
import { Beatmap, IBeatmap } from '../models/Beatmap.model';
import { getBeatmapBetweenStars, standardStars } from './create-game';

export async function createScheduledGame(
  { title, roundBeatmaps, date, minRank, maxRank }: ICreateScheduledGameOptions,
  user: IUser,
): Promise<IGame> {
  const shouldUseRandombeatmaps = roundBeatmaps.some(b => !b) || undefined;
  let beatmaps =
    shouldUseRandombeatmaps &&
    (await Beatmap.aggregate([{ $sample: { size: 3000 } }]));

  if (shouldUseRandombeatmaps) {
    roundBeatmaps = roundBeatmaps.map((r, idx) => {
      if (r) {
        // If beatmap is already defined, use the given beatmap
        return r;
      } else {
        // Get a random beatmap from the standard star ratings
        const [beatmap, remaining] = getBeatmapBetweenStars(
          <IBeatmap[]>beatmaps,
          standardStars[idx][0],
          standardStars[idx][1],
          40 + 10 * idx, // min length starts 40 secs, increment by 10 per round
          160 + 20 * idx, // max length starts 160, increments by 20
        );
        beatmaps = remaining;

        return beatmap;
      }
    });
  }

  return await Game.create({
    title,
    beatmaps: roundBeatmaps,
    status: 'scheduled',
    nextStageStarts: date,
    minRank,
    maxRank,
    owner: user._id,
  });
}

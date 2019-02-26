import { IUser } from './../models/User.model';
import { ICreateScheduledGameOptions } from '../api/lobbies/create-game';
import { Game, IGame } from '../models/Game.model';
import { Beatmap, IBeatmap } from '../models/Beatmap.model';
import { getBeatmapBetweenStars } from './create-game';

const stars = [
  [3, 3.8],
  [4.5, 5],
  [5, 5.5],
  [5.5, 6],
  [6, 6.5],
  [6, 6.7],
  [6, 6.9],
  [6.5],
  [6.5],
  [6.8],
];

export async function createScheduledGame(
  {
    title,
    roundBeatmaps,
    nextStageStarts,
    minRank,
    maxRank,
    description,
  }: ICreateScheduledGameOptions,
  user: IUser,
): Promise<IGame> {
  return await Game.create({
    title,
    beatmaps: await fillUndefinedBeatmapsWithRandom(roundBeatmaps),
    status: 'scheduled',
    nextStageStarts,
    minRank,
    maxRank,
    owner: user._id,
    description,
  });
}

export async function fillUndefinedBeatmapsWithRandom(
  roundBeatmaps: ICreateScheduledGameOptions['roundBeatmaps'],
): Promise<IBeatmap[]> {
  const shouldUseRandombeatmaps = !roundBeatmaps || roundBeatmaps.some(b => !b);
  let beatmaps =
    shouldUseRandombeatmaps &&
    (await Beatmap.aggregate([{ $sample: { size: 3000 } }]));
  let finalBeatmaps: Array<IBeatmap | undefined> = roundBeatmaps;

  if (shouldUseRandombeatmaps) {
    finalBeatmaps = roundBeatmaps.map((r, idx) => {
      if (r) {
        // If beatmap is already defined, use the given beatmap
        return r;
      } else {
        // Get a random beatmap from the standard star ratings
        const [beatmap, remaining] = getBeatmapBetweenStars(
          <IBeatmap[]>beatmaps,
          stars[idx][0],
          stars[idx][1],
          90 + 15 * idx, // min length
          160 + 20 * idx, // max length
        );
        beatmaps = remaining;

        return beatmap;
      }
    });
  }

  return <IBeatmap[]>finalBeatmaps;
}

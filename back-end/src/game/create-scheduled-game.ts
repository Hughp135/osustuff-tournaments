import { IUser } from './../models/User.model';
import { ICreateScheduledGameOptions } from '../api/lobbies/create-game';
import { Game, IGame } from '../models/Game.model';
import { Beatmap, IBeatmap } from '../models/Beatmap.model';
import { getBeatmapBetweenStars } from './create-game';
import { getModeName } from '../helpers/game-mode';
import { getRecentBeatmaps } from '../services/osu-api';

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
    gameMode,
    password,
  }: ICreateScheduledGameOptions,
  user: IUser,
): Promise<IGame> {
  return await Game.create({
    title,
    beatmaps: await fillUndefinedBeatmapsWithRandom(roundBeatmaps, gameMode),
    status: 'scheduled',
    nextStageStarts,
    minRank,
    maxRank,
    owner: user._id,
    description,
    gameMode,
    hasPassword: !!password,
    password,
  });
}

export async function fillUndefinedBeatmapsWithRandom(
  roundBeatmaps: ICreateScheduledGameOptions['roundBeatmaps'],
  gameMode: IGame['gameMode'],
): Promise<IBeatmap[]> {
  const shouldUseRandombeatmaps = !roundBeatmaps || roundBeatmaps.some(b => !b);
  const modeHumanReadable = getModeName(gameMode);
  const beatmapFilters =
    modeHumanReadable === 'mania'
      ? {
          diff_size: '4',
        }
      : {};

  let beatmaps =
    shouldUseRandombeatmaps &&
    (await Beatmap.aggregate([
      { $match: { mode: gameMode, ...beatmapFilters } },
      { $sample: { size: 3000 } },
    ]));
  let finalBeatmaps: Array<IBeatmap | undefined> = roundBeatmaps;
  if (!beatmaps || !beatmaps.length) {
    beatmaps = [];
    const recentBeatmaps = (await getRecentBeatmaps(gameMode)).filter((b: any) => {
      const validLength = parseInt(b.total_length, 10) <= 600;
      const validSize =
        modeHumanReadable === 'mania' ? b.diff_size === '4' : true;

      return validLength && validSize;
    });
    beatmaps.push(...recentBeatmaps);
  }

  if (shouldUseRandombeatmaps) {
    finalBeatmaps = roundBeatmaps.map((r, idx) => {
      if (r) {
        // If beatmap is already defined, use the given beatmap
        return r;
      } else {
        // Get a random beatmap from the standard star ratings
        const [beatmap, remaining] = getBeatmapBetweenStars(
          <IBeatmap[]>beatmaps,
          gameMode,
          {
            min: stars[idx][0],
            max: stars[idx][1],
            minLength: 90 + 15 * idx, // min length
            maxLength: 160 + 20 * idx, // max length
          },
        );
        beatmaps = remaining;

        return beatmap;
      }
    });
  }

  return <IBeatmap[]>finalBeatmaps;
}

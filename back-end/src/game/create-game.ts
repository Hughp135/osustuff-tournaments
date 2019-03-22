import { getModeName, modeName } from './../helpers/game-mode';
import { IBeatmap } from './../models/Beatmap.model';
import { Game, IGame } from '../models/Game.model';
import { addSamplePlayers } from '../test-helpers/add-sample-players';
import config from 'config';
import { Beatmap } from '../models/Beatmap.model';
import { logger } from '../logger';
import { randomFromArray } from '../helpers/random-from-array';

const TEST_MODE = config.get('TEST_MODE');

const numRounds = 10; // max number of rounds that will be played
// Set Min/Max beatmap difficulties per round for each type of lobby
export const standardStars: Array<[number, number]> = new Array(numRounds)
  .fill(null)
  .map((_, idx) => {
    if (idx < 3) {
      return <[number, number]>[3 + idx * 0.5, 3.8 + idx * 0.5];
    }
    return <[number, number]>[
      Math.min(6, 4 + idx * 0.3),
      idx > 7 ? 8 : 5 + idx * 0.3,
    ];
  });
export const maniaStars: Array<[number, number]> = new Array(numRounds)
  .fill(null)
  .map((_, idx) => {
    return <[number, number]>[2 + idx * 0.5, 2.5 + idx * 0.5];
  });
export const taikoStars: Array<[number, number]> = new Array(numRounds)
  .fill(null)
  .map((_, idx) => {
    return <[number, number]>[2 + idx * 0.4, 2.5 + idx * 0.4];
  });
export const harderStars: Array<[number, number]> = new Array(numRounds)
  .fill(null)
  .map((_, idx) => {
    return <[number, number]>[
      Math.min(6.5, 5 + idx * 0.2),
      Math.min(8.5, 5.5 + idx * 0.3),
    ];
  });
// console.log(
//   harderStars.map(([min, max], idx) => `Round ${idx + 1}: ${min}* - ${max}*`),
// );
const easyLobbyStars: Array<[number, number]> = new Array(numRounds)
  .fill(null)
  .map(
    (_, idx) =>
      <[number, number]>[
        Math.max(5, 2 + idx * 0.4),
        Math.min(5.5, 3 + idx * 0.4),
      ],
  );

export async function createGame(
  getRecentBeatmaps: (mode?: string) => Promise<any>,
  minRank?: number,
  testPlayers?: number,
  gameMode: '0' | '1' | '2' | '3' = '0',
): Promise<IGame> {
  const modeHumanReadable = getModeName(gameMode);
  const beatmapFilters =
    modeHumanReadable === 'mania'
      ? {
          diff_size: '4',
        }
      : {};
  const savedBeatmaps = await Beatmap.aggregate([
    { $match: { mode: gameMode, ...beatmapFilters } },
    { $sample: { size: 1500 } },
  ]);
  let beatmaps = (await getRecentBeatmaps(gameMode)).filter((b: any) => {
    const validLength = parseInt(b.total_length, 10) <= 600;
    const validSize =
      modeHumanReadable === 'mania' ? b.diff_size === '4' : true;

    return validLength && validSize;
  });
  beatmaps.push(...savedBeatmaps);
  logger.info(`Total beatmap count: ${beatmaps.length}`);

  const difficulties = getGameModeStars(modeHumanReadable, minRank);
  const roundBeatmaps = difficulties
    .map((_, idx) => {
      const [beatmap, remaining] = getBeatmapBetweenStars(
        beatmaps,
        difficulties[idx][0],
        difficulties[idx][1],
        40 + 10 * idx, // min length starts 40 secs, increment by 10 per round
        160 + 20 * idx, // max length starts 160, increments by 20
      );
      beatmaps = remaining;

      return beatmap;
    })
    .sort(
      (a, b) => parseFloat(a.difficultyrating) - parseFloat(b.difficultyrating),
    );

  const gameModeStr =
    gameMode === '3'
      ? 'mania [4K]'
      : gameMode === '2'
      ? 'ctb'
      : gameMode === '1'
      ? 'taiko'
      : '';

  const game = await Game.create({
    title: `osu!${gameModeStr} Royale Match${
      minRank ? ` (rank ${minRank / 1000}k+)` : ''
    }`,
    beatmaps: roundBeatmaps,
    status: 'new',
    minRank,
    gameMode,
  });

  if (TEST_MODE && game.status !== 'scheduled') {
    logger.info(
      `(game id: ${game._id.toHexString()}) Creating game with sample players.`,
    );
    await addSamplePlayers(game, testPlayers || 10);
  }

  return game;
}

function getGameModeStars(mode: modeName, minRank?: number) {
  if (mode === 'mania') {
    return maniaStars;
  }

  if (mode === 'taiko') {
    return taikoStars;
  }

  if (mode === 'ctb') {
    return minRank ? easyLobbyStars : harderStars;
  }

  return minRank ? easyLobbyStars : standardStars;
}

export function getBeatmapBetweenStars(
  beatmaps: IBeatmap[],
  min: number,
  max?: number,
  minLength?: number,
  maxLength?: number,
): [IBeatmap, IBeatmap[]] {
  const filtered = beatmaps.filter((b: any) => {
    const stars = parseFloat(b.difficultyrating);
    const inStarRange = stars >= min && (max ? stars < max : true);
    const longEnough = minLength ? b.total_length >= minLength : true;
    const shortEnough = maxLength ? b.total_length <= maxLength : true;

    return inStarRange && longEnough && shortEnough;
  });

  if (!filtered.length) {
    if (min >= 0) {
      return getBeatmapBetweenStars(beatmaps, min - 0.5, max);
    } else if (minLength && minLength >= 0) {
      return getBeatmapBetweenStars(beatmaps, min, max, minLength - 20);
    } else if (maxLength && maxLength < 500) {
      return getBeatmapBetweenStars(
        beatmaps,
        min,
        max,
        minLength,
        maxLength + 20,
      );
    } else {
      throw new Error('Ran out of beatmaps to pick from');
    }
  }

  const random = randomFromArray(filtered);

  beatmaps = beatmaps.filter(b => b.beatmapset_id !== random.beatmapset_id);

  return [random, beatmaps];
}

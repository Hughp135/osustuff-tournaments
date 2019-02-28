import { IBeatmap } from './../models/Beatmap.model';
import { Game, IGame } from '../models/Game.model';
import { addSamplePlayers } from '../test-helpers/add-sample-players';
import config from 'config';
import { Beatmap } from '../models/Beatmap.model';
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
  getRecentBeatmaps: () => Promise<any>,
  minRank?: number,
  testPlayers?: number,
): Promise<IGame> {
  const savedBeatmaps = await Beatmap.aggregate([{ $sample: { size: 1500 } }]);
  let beatmaps = (await getRecentBeatmaps()).filter(
    (b: any) => parseInt(b.total_length, 10) <= 600,
  );
  beatmaps.push(...savedBeatmaps);
  console.info('total beatmaps', beatmaps.length);

  const difficulties = minRank ? easyLobbyStars : standardStars;
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

  const game = await Game.create({
    title: `osu! Royale Match${minRank ? ` (rank ${minRank / 1000}k+)` : ''}`,
    beatmaps: roundBeatmaps,
    status: 'new',
    minRank,
  });

  if (TEST_MODE && game.status !== 'scheduled') {
    console.info('Creating game with sample players');
    await addSamplePlayers(game, testPlayers || 10);
  }

  return game;
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

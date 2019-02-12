import { Game, IGame } from '../models/Game.model';
import { addSamplePlayers } from '../test-helpers/add-sample-players';
import config from 'config';

const TEST_MODE = config.get('TEST_MODE');

let beatmaps: any[];

export async function createGame(
  getRecentBeatmaps: () => Promise<any>,
  scheduledDate?: Date,
  minRank?: number,
  testPlayers?: number,
): Promise<IGame> {
  beatmaps = (await getRecentBeatmaps()).filter(
    (b: any) => parseInt(b.total_length, 10) <= 600,
  );

  const numRounds = 10;
  // Min/Max beatmap difficulties per round
  const standardStars: Array<[number, number]> = new Array(numRounds)
  .fill(null)
  .map((_, idx) => <[number, number]> [4 + idx * 0.3, idx > 7 ? undefined : 5 + idx * 0.3]);
  const easyLobbyStars: Array<[number, number]> = new Array(numRounds)
    .fill(null)
    .map((_, idx) => <[number, number]> [2 + idx * 0.3, 3 + idx * 0.3]);

  const difficulties = minRank ? easyLobbyStars : standardStars;
  const roundBeatmaps = new Array(difficulties.length).fill(null).map((_, idx) =>
    getBeatmapBetweenStars(
      difficulties[idx][0],
      difficulties[idx][1],
      40 + 10 * idx, // min length starts 40 secs, increment by 10 per round
      160 + 20 * idx, // max length starts 160, increments by 20
    ),
  );

  const game = await Game.create({
    title: `osu! Royale Match${minRank ? ` (rank ${minRank / 1000}k+)` : ''}`,
    beatmaps: roundBeatmaps,
    status: scheduledDate ? 'scheduled' : 'new',
    nextStageStarts: scheduledDate || undefined,
    minRank,
  });

  if (TEST_MODE && game.status !== 'scheduled') {
    console.log('Creating game with sample players');
    await addSamplePlayers(game, testPlayers || 8);
  }

  return game;
}

function getBeatmapBetweenStars(
  min: number,
  max?: number,
  minLength?: number,
  maxLength?: number,
): any {
  const filtered = beatmaps.filter((b: any) => {
    const stars = parseFloat(b.difficultyrating);
    const inStarRange = stars >= min && (max ? stars < max : true);
    const longEnough = minLength ? b.total_length >= minLength : true;
    const shortEnough = maxLength ? b.total_length <= maxLength : true;

    return inStarRange && longEnough && shortEnough;
  });

  if (!filtered.length) {
    if (min >= 0) {
      return getBeatmapBetweenStars(min - 0.5, max);
    } else if (minLength && minLength >= 0) {
      return getBeatmapBetweenStars(min, max, minLength - 20);
    } else if (maxLength && maxLength < 500) {
      return getBeatmapBetweenStars(min, max, minLength, maxLength + 20);
    } else {
      throw new Error('Ran out of beatmaps to pick from');
    }
  }

  const random = arrayRandVal(filtered);

  beatmaps = beatmaps.filter(b => b.beatmapset_id !== random.beatmapset_id);

  return random;
}

export function arrayRandVal(myArray: any[]) {
  return myArray[Math.floor(Math.random() * myArray.length)];
}

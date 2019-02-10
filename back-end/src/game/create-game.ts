import { Game, IGame } from '../models/Game.model';
import { addSamplePlayers } from '../test-helpers/add-sample-players';
import config from 'config';

const TEST_MODE = config.get('TEST_MODE');

let beatmaps: any[];

export async function createGame(
  getRecentBeatmaps: () => Promise<any>,
  scheduledDate?: Date,
  testPlayers?: number,
): Promise<IGame> {
  beatmaps = (await getRecentBeatmaps()).filter(
    (b: any) => parseInt(b.total_length, 10) <= 600,
  );

  const roundBeatmaps = [
    getBeatmapBetweenStars(3, 4, 40, 160),
    getBeatmapBetweenStars(4, 4.5, 50, 180),
    getBeatmapBetweenStars(4.5, 5, 60, 200),
    getBeatmapBetweenStars(4.8, 5.3, 70, 220),
    getBeatmapBetweenStars(5, 6, 80, 240),
    getBeatmapBetweenStars(5.5, 6.5, 90, 260),
    getBeatmapBetweenStars(6, 6.5, 100, 280),
    getBeatmapBetweenStars(6, 110, 300),
    getBeatmapBetweenStars(6, 120, 360),
    getBeatmapBetweenStars(6, 140, 480),
  ];

  const game = await Game.create({
    title: 'osu! Royale Match',
    beatmaps: roundBeatmaps,
    status: scheduledDate ? 'scheduled' : 'new',
    nextStageStarts: scheduledDate || undefined,
  });

  if (TEST_MODE && game.status !== 'scheduled') {
    console.log('Creating game with sample players');
    await addSamplePlayers(game, testPlayers || 900);
  }

  return game;
}

function getBeatmapBetweenStars(min: number, max?: number, minLength?: number, maxLength?: number): any {
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

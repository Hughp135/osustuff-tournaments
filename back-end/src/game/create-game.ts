import { Game, IGame } from '../models/Game.model';
import { addSamplePlayers } from '../test-helpers/add-sample-players';
import config from 'config';

const TEST_MODE = config.get('TEST_MODE');

let beatmaps: any[];

export async function createGame(getRecentBeatmaps: () => Promise<any>): Promise<IGame> {
  beatmaps = await getRecentBeatmaps();

  const roundBeatmaps = [
    getBeatmapBetweenStars(3, 4),
    getBeatmapBetweenStars(4, 4.5),
    getBeatmapBetweenStars(4.5, 5),
    getBeatmapBetweenStars(4.8, 5.3),
    getBeatmapBetweenStars(5, 6),
    getBeatmapBetweenStars(5.3, 6.3),
    getBeatmapBetweenStars(5.5, 6.5),
    getBeatmapBetweenStars(6),
    getBeatmapBetweenStars(6),
    getBeatmapBetweenStars(6),
  ];

  const game = await Game.create({
    title: 'osu! Royale Match',
    beatmaps: roundBeatmaps,
  });

  if (TEST_MODE) {
    console.log('Creating game with sample players');
    await addSamplePlayers(game, 50);
  }

  return game;
}

function getBeatmapBetweenStars(min: number, max?: number): any {
  const filtered = beatmaps.filter((b: any) => {
    const stars = parseFloat(b.difficultyrating);

    return stars >= min && (max ? stars < max : true);
  });

  if (!filtered.length) {
    if (min >= 0) {
      return getBeatmapBetweenStars(min - 0.5, max);
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

import { IRound } from './../models/Round.model';
import { IGame } from './../models/Game.model';
import mongoose from 'mongoose';
import { getUserRecent } from '../services/osu-api';
import { Score } from '../models/Score.model';
import { User } from '../models/User.model';

let gameIdsBeingChecked: mongoose.Types.ObjectId[] = [];

export async function checkPlayerScores(game: IGame, round: IRound) {
  console.log('checking scores');
  await game.save();

  gameIdsBeingChecked.push(game._id);

  await checkUserScores(game, round);

  setTimeout(() => {
    // absolute worst case clear game so it doesn't linger on
    stopCheckingScores(game);
  }, 120000);
}

export function stopCheckingScores(game: IGame) {
  if (shouldCheckScore(game)) {
    console.log('stopped checking scores', game._id);
    gameIdsBeingChecked = gameIdsBeingChecked.filter(
      g => g.toString() !== game._id.toString(),
    );
  }
}

function shouldCheckScore(game: IGame) {
  return gameIdsBeingChecked.find(g => g.toString() === game._id.toString());
}

async function checkUserScores(game: IGame, round: IRound) {
  if (!shouldCheckScore(game)) {
    return;
  }

  const players = game.players.filter(p => p.alive);
  const beatmapId = round.beatmap.beatmapId;

  await Promise.all(
    players.map(async p => {
      const scores = await getUserRecent(p.username);

      if (!shouldCheckScore(game)) {
        return;
      }

      // find the highest correct score on this beatmap
      const [score] = scores
        .filter(
          (s: any) =>
            s.beatmap_id === beatmapId &&
            new Date(s.date) > (<any> round).createdAt,
        )
        .sort(
          (a: any, b: any) => parseInt(b.score, 10) - parseInt(a.score, 10),
        );

      if (score) {
        const user = await User.findOne({ username: p.username }).lean();
        const existing = await Score.findOne({
          roundId: round._id,
          userId: user._id,
        });

        // Ensure score beats any existing scores, then save it
        if ((existing && score.score > existing.score) || !existing) {
          await Score.create({
            roundId: round._id,
            userId: user._id,
            score: parseInt(score.score, 10),
            mods: parseInt(score.enabled_mods, 10),
            rank: score.rank,
            maxCombo: parseInt(score.maxcombo, 10),
            misses: parseInt(score.countmiss, 10),
          });
        }
      }
    }),
  );

  // Call self again after 5 seconds
  setTimeout(async () => await checkUserScores(game, round), 5000);
}

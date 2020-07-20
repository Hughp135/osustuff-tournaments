import { IGame } from '../models/Game.model';
import { Score } from '../models/Score.model';
import { cache } from '../services/cache';
import { addOnlineUser } from '../helpers/add-online-user';
import { randomFromArray } from '../helpers/random-from-array';

export async function addSampleScores(game: IGame) {
  await Promise.all(
    game.players
      .filter(p => p.alive && Math.random() <= 0.95)
      .map(async player => {
        cache.put(`user-active-${player.userId}`, true, 120000);
        addOnlineUser({ _id: player.userId });
        // Generate 1 or 2 scores per player
        for (let i = 0; i < Math.round(Math.random()) + 1; i++) {
          const score = Math.floor(Math.random() * 50);
          await Score.create({
            gameId: game._id,
            roundId: game.currentRound,
            userId: player.userId,
            username: player.username,
            score,
            mods: generateMods(),
            rank: randomFromArray([
              'XH',
              'X',
              'SH',
              'S',
              'A',
              'B',
              'C',
              'D',
              'F',
            ]),
            maxCombo: randomFromArray([10, 9, 7]),
            count100: Math.floor(Math.random() * 50),
            accuracy:
              Math.random() <= 0.8
                ? randomFromArray([100, 99, 98, 95, 90])
                : parseFloat((Math.random() * 100).toFixed(2)),
            misses:
              Math.random() <= 0.7
                ? randomFromArray([0, 1, 2])
                : Math.floor(Math.random() * 50),
            date: new Date(),
          });
        }
      }),
  );
}

function generateMods() {
  let mods = 0;

  if (Math.random() <= 0.65) {
    // Add mods.
    if (Math.random() <= 0.35) {
      // Add HR/EZ.
      if (Math.random() <= 0.95) {
        mods += 16; // HR
      } else {
        mods += 2; // EZ
      }
    }

    if (Math.random() <= 0.35) {
      mods += 8; // HD
    }

    if (Math.random() <= 0.35) {
      // Add DT/NC/HT.
      if (Math.random() <= 0.95) {
        // Add DT/NC.
        if (Math.random() <= 0.95) {
          mods += 64; // DT
        } else {
          mods += 576; // NC
        }
      } else {
        mods += 256; // HT
      }
    }

    if (Math.random() <= 0.08) {
      // Add SD/PF.
      if (Math.random() <= 0.65) {
        mods += 32; // SD
      } else {
        mods += 16416; // PF
      }
    }

    if (Math.random() <= 0.1) {
      mods += 1024; // HT
    }

    if (Math.random() <= 0.15) {
      mods += 1; // NF
    }

    if (Math.random() <= 0.2) {
      mods += 4096; // SO
    }

    if (Math.random() <= 0.05) {
      mods += 4; // TD
    }

    if (Math.random() <= 0.9) {
      mods += 536870912; // Score V2
    }
  }

  return mods;
}

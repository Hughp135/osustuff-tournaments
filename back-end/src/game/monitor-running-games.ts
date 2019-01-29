import { IGame } from './../models/Game.model';
import { Game } from '../models/Game.model';
import { Round, IRound } from '../models/Round.model';
import { stopCheckingScores } from './check-player-scores';
import { roundEnded } from './round-ended';
import winston from 'winston';
import { nextRound } from './next-round';
import { endGame } from './end-game';
import { createGame } from './create-game';

let isMonitoring = false;

export async function startMonitoring() {
  if (isMonitoring) {
    throw new Error('Already monitoring');
  }

  isMonitoring = true;

  await updateRunningGames();
}

// Update games based on status
export async function updateRunningGames() {
  if (!isMonitoring) {
    return;
  }

  const games = await Game.find({
    status: ['new', 'in-progress', 'round-over'],
  });

  if (games.length === 0) {
    console.log('creating a new game as none are running');
    // Keep at least 1 running game
    await createGame();
  }

  await Promise.all(
    games.map(async game => {
      try {
        const round = await Round.findById(game.currentRound);
        switch (game.status) {
          case 'new':
            return await startGame(game);
          case 'in-progress':
            return await checkRoundEnded(game, <IRound> round);
          case 'round-over':
            return await completeRound(game);
        }
      } catch (e) {
        winston.log('error', 'Failed to update games', e);
      }
    }),
  );

  // Call self again
  setTimeout(async () => {
    await updateRunningGames();
  }, 1000);
}

async function startGame(game: IGame) {
  if (!game.players.length) {
    console.log('No players to start');
    if (game.nextStageStarts) {
      console.log('canceling countdown');
      // Cancel countdown
      game.nextStageStarts = undefined;
      await game.save();
    }
    return;
  }

  if (!game.nextStageStarts) {
    console.log('Beginning countdown....');
    // Set the countdown to start
    const starts = new Date();
    starts.setSeconds(starts.getSeconds() + 5);
    game.nextStageStarts = starts;
    await game.save();
  } else if (game.nextStageStarts < new Date()) {
    // Start the first round
    await nextRound(game, { beatmapId: '932223', title: 'test', duration: 30 });
  }
}

async function checkRoundEnded(game: IGame, round: IRound) {
  // Check if next round should start
  if (<Date> game.nextStageStarts < new Date()) {
    await stopCheckingScores(game);
    await roundEnded(game, round);
  }
}

async function completeRound(game: IGame) {
  const alivePlayers = game.players.filter(p => p.alive);

  if (alivePlayers.length > 1) {
    console.log('players still alive, starting next round');
    // Start the next round
    await nextRound(game, { beatmapId: '932223', title: 'test', duration: 30 });
  } else {
    // End the game
    await endGame(game);
  }
}

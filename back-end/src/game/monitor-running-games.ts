import { IGame } from './../models/Game.model';
import { Game } from '../models/Game.model';
import { Round, IRound } from '../models/Round.model';
import { checkRoundScores } from './check-player-scores';
import { roundEnded } from './round-ended';
import winston from 'winston';
import { nextRound } from './next-round';
import { endGame } from './end-game';
import { createGame } from './create-game';
import { getUserRecent } from '../services/osu-api';

let isMonitoring = false;

export async function startMonitoring() {
  if (isMonitoring) {
    throw new Error('Already monitoring');
  }

  isMonitoring = true;

  await updateRunningGames();
}

export function stopMonitoring() {
  isMonitoring = false;
}

// Update games based on status
export async function updateRunningGames() {
  console.log('updating games');
  const games = await Game.find({
    status: ['new', 'in-progress', 'round-over'],
  });

  if (games.length === 0) {
    console.log('creating a new game as none are running');
    // If no games are active, create a new one
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
    if (isMonitoring) {
      await updateRunningGames();
    }
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
    await setNextStageStartsAt(game, 5);
  } else if (game.nextStageStarts < new Date()) {
    // Start the first round
    await nextRound(game, { beatmapId: '932223', title: 'test', duration: 30 });
  }
}

async function checkRoundEnded(game: IGame, round: IRound) {
  // Check if next round should start
  if (<Date> game.nextStageStarts < new Date()) {
    game.status = 'checking-scores';
    await game.save();
    await checkRoundScores(game, round, getUserRecent);
    await roundEnded(game, round);
    await setNextStageStartsAt(game, 30);
  }
}

async function completeRound(game: IGame) {
  const alivePlayers = game.players.filter(p => p.alive);

  if (alivePlayers.length > 1) {
    console.log('players still alive, starting next round');
    // Start the next round
    await nextRound(game, { beatmapId: '932223', title: 'test', duration: 30 });
    await setNextStageStartsAt(game, 10);
  } else {
    // End the game
    await endGame(game);
  }
}

async function setNextStageStartsAt(game: IGame, seconds: number) {
  const date = new Date();
  date.setSeconds(date.getSeconds() + seconds);

  // Update game status and set time to next stage
  game.nextStageStarts = date;
  await game.save();
}

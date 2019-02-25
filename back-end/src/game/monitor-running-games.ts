import { IGame } from './../models/Game.model';
import { Game } from '../models/Game.model';
import { Round, IRound } from '../models/Round.model';
import { checkRoundScores } from './check-player-scores';
import { roundEnded } from './round-ended';
import { nextRound } from './next-round';
import { endGame } from './end-game';
import { createGame } from './create-game';
import { getUserRecent, getRecentBeatmaps } from '../services/osu-api';
import config from 'config';
import { addSampleChatMessage } from '../test-helpers/add-sample-chat-message';
import { COUNTDOWN_START } from './durations';
import { cache } from '../services/cache';
import { ObjectId } from 'bson';
import { Score } from '../models/Score.model';
import { logger } from '../logger';
import { removeAfkPlayers } from './remove-afk-players';
import { updatePlayerAchievements } from '../achievements/update-player-achievements';

const TEST_MODE = config.get('TEST_MODE');
const FAST_FORWARD_MODE = config.get('FAST_FORWARD_MODE');
const PLAYERS_REQUIRED_TO_START = config.get('PLAYERS_REQUIRED_TO_START');
const DISABLE_LOWER_LVL_LOBBIES = config.get('DISABLE_LOWER_LVL_LOBBIES');
let DISABLE_AUTO_GAME_CREATION = config.get('DISABLE_AUTO_GAME_CREATION');
const SERVER_START_DATE = new Date();
export let isMonitoring = false;
let gamesBeingUpdated: string[] = [];
let creatingNewGame = false;

export async function startMonitoring() {
  console.info('starting monitoring');

  if (isMonitoring) {
    throw new Error('Already monitoring');
  }

  isMonitoring = true;

  setInterval(async () => {
    if (isMonitoring) {
      await updateRunningGames(getRecentBeatmaps);
    }
  }, 1000);
}

export function stopMonitoring() {
  isMonitoring = false;
}

// Update games based on status
export async function updateRunningGames(getRecentMaps: () => Promise<any>) {
  const games = await Game.find({
    status: ['scheduled', 'new', 'in-progress', 'round-over', 'checking-scores'],
  });

  if (!creatingNewGame) {
    creatingNewGame = true;
    try {
       // NOT awaited intentionally
      createNewGame(games, getRecentMaps).then(() => { // tslint:disable-line:no-floating-promises
        creatingNewGame = false;
      });
    } catch (e) {
      console.error('Failed to create game', e);
    }
  }

  if (TEST_MODE) {
    await Promise.all(games.map(async g => await addSampleChatMessage(g)));
  }

  const promises = games.map(async game => {
    if (gamesBeingUpdated.includes(game._id.toString())) {
      // This game is being updated already, don't do anything.
      return;
    }
    gamesBeingUpdated.push(game._id.toString());
    try {
      switch (game.status) {
        case 'scheduled':
          await openScheduledGame(game);
          break;
        case 'new':
          await startGame(game);
          break;
        case 'in-progress':
          await checkRoundEnded(game);
          break;
        case 'checking-scores':
          await skipCheckingScore(game);
          break;
        case 'round-over':
          await completeRound(game);
          break;
      }
    } catch (e) {
      console.error('Failed to update game with status ' + game.status, e);
    }
    gamesBeingUpdated = gamesBeingUpdated.filter(g => g !== game._id.toString());
  });

  await Promise.all(promises);
}

async function createNewGame(games: IGame[], getRecentMaps: () => Promise<any>) {
  const newGames = games.filter(g => g.status === 'new');
  const testSkipCreate = TEST_MODE && newGames.length >= 2;
  const anyRankGames = newGames.filter(g => !g.minRank);
  const minRankGames = newGames.filter(g => !!g.minRank);

  if (!DISABLE_AUTO_GAME_CREATION && !testSkipCreate) {
    // If no games are active, create a new one

    try {
      if (anyRankGames.length === 0) {
        console.info('creating a new game');
        await createGame(getRecentMaps).catch(e => logger.error('Failed to create game', e));
      }
      if (!DISABLE_LOWER_LVL_LOBBIES && minRankGames.length === 0) {
        console.info('creating a new game with min rank');
        await createGame(getRecentMaps, 45000).catch(e =>
          logger.error('Failed to create game', e),
        );
      }
    } catch (e) {
      console.error(e);
    }
  }
}

async function openScheduledGame(game: IGame) {
  if (game.nextStageStarts && game.nextStageStarts < new Date()) {
    console.info('Opening scheduled game');
    game.nextStageStarts = undefined;
    game.status = 'new';
    await game.save();
  }
}

async function startGame(game: IGame) {
  if (Date.now() - SERVER_START_DATE.getTime() > 30000) {
    await removeAfkPlayers(game);
  }

  const enoughPlayers = game.players.length >= PLAYERS_REQUIRED_TO_START;
  if (!enoughPlayers) {
    if (game.nextStageStarts) {
      console.info('canceling countdown');
      // Cancel countdown
      game.nextStageStarts = undefined;
      await game.save();
      clearGetLobbyCache(game._id);
    }

    return;
  }

  if (!game.nextStageStarts) {
    console.info('Beginning countdown....');
    // Set the countdown to start
    if (!FAST_FORWARD_MODE) {
      await setNextStageStartsAt(game, COUNTDOWN_START);
    } else {
      const date = new Date();
      date.setSeconds(date.getSeconds() + 120);
      game.nextStageStarts = date;
      await game.save();
    }
  } else if (game.nextStageStarts < new Date()) {
    // Start the first round
    await nextRound(game);
    clearGetLobbyCache(game._id);
  }
}

async function checkRoundEnded(game: IGame) {
  // Check if next round should start
  if (<Date> game.nextStageStarts < new Date()) {
    const round = <IRound> await Round.findById(game.currentRound);
    await checkRoundScores(game, round, getUserRecent);
    await roundEnded(game, round);
    await updatePlayerAchievements(game);
    clearGetLobbyCache(game._id);
  }
}

async function completeRound(game: IGame) {
  const alivePlayers = game.players.filter(p => p.alive);

  if (<Date> game.nextStageStarts < new Date()) {
    if (game.roundNumber !== 10 && alivePlayers.length > 1) {
      // Start the next round
      await nextRound(game);
      clearGetLobbyCache(game._id);
    } else {
      // End the game
      await endGame(game);
      clearGetLobbyCache(game._id);
    }
  }
}

async function setNextStageStartsAt(game: IGame, seconds: number) {
  const date = new Date();
  date.setSeconds(date.getSeconds() + (FAST_FORWARD_MODE ? 1 : seconds));

  // Update game status and set time to next stage
  game.nextStageStarts = date;
  await game.save();
}

async function skipCheckingScore(game: IGame) {
  if (game.status === 'checking-scores' && <Date> game.nextStageStarts < new Date()) {
    const round = <IRound> await Round.findById(game.currentRound);
    logger.error('Checking scores not complete after 2 minutes', {
      gameId: game._id,
      round: round._id,
      playersAliveCount: game.players.filter(p => p.alive).length,
    });
    const scoresCount = await Score.countDocuments({ roundId: game._id });
    const alivePlayersCount = game.players.filter(p => p.alive).length;
    if (scoresCount >= alivePlayersCount / 2) {
      logger.info('Ending round as at least half alive players have set score');
      await roundEnded(game, round);
      await updatePlayerAchievements(game);
    } else {
      logger.info('Checking scores again');
      await checkRoundEnded(game);
    }
    clearGetLobbyCache(game._id);
  }
}

export function clearGetLobbyCache(gameId: string | ObjectId) {
  cache.del(`get-lobby-${gameId}`);
}

export function toggleAutoCreation() {
  DISABLE_AUTO_GAME_CREATION = !DISABLE_AUTO_GAME_CREATION;
}

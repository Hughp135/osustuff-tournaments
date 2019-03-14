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
import { removeAfkPlayers } from './remove-afk-players';
import { updatePlayerAchievements } from '../achievements/update-player-achievements';
import { sendGameToSocket } from './update-game';
import { sendPlayersToSocket } from './players/update-players';
import { logger } from '../logger';

const TEST_MODE = config.get('TEST_MODE');
const FAST_FORWARD_MODE = config.get('FAST_FORWARD_MODE');
const PLAYERS_REQUIRED_TO_START = config.get('PLAYERS_REQUIRED_TO_START');
const DISABLE_LOWER_LVL_LOBBIES = config.get('DISABLE_LOWER_LVL_LOBBIES');
const DISABLE_MANIA_LOBBIES = config.get('DISABLE_MANIA');
let DISABLE_AUTO_GAME_CREATION = config.get('DISABLE_AUTO_GAME_CREATION');
const SERVER_START_DATE = new Date();
export let isMonitoring = false;
let gamesBeingUpdated: string[] = [];
let creatingNewGame = false;

export async function startMonitoring() {
  logger.info('Starting to monitor...');

  if (isMonitoring) {
    logger.error('Already monitoring!');
    throw new Error();
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
    status: [
      'scheduled',
      'new',
      'in-progress',
      'round-over',
      'checking-scores',
    ],
  });

  if (!creatingNewGame) {
    creatingNewGame = true;
    try {
      // NOT awaited intentionally
      // tslint:disable-next-line:no-floating-promises
      createNewGame(games, getRecentMaps).then(() => {
        creatingNewGame = false;
      });
    } catch (e) {
      logger.error('Failed to create game!', e);
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
    const updates: boolean[] = [];

    try {
      switch (game.status) {
        case 'scheduled':
          updates.push(await openScheduledGame(game));
          break;
        case 'new':
          updates.push(await startGame(game));
          break;
        case 'in-progress':
          updates.push(await checkRoundEnded(game));
          break;
        case 'checking-scores':
          updates.push(await skipCheckingScore(game));
          break;
        case 'round-over':
          updates.push(await completeRound(game));
          break;
      }

      if (updates.includes(true)) {
        await sendGameToSocket(game);
      }
    } catch (e) {
      logger.error(`Failed to update game with status ${game.status}!`, e);
    }
    gamesBeingUpdated = gamesBeingUpdated.filter(
      g => g !== game._id.toString(),
    );
  });

  await Promise.all(promises);
}

async function createNewGame(
  games: IGame[],
  getRecentMaps: () => Promise<any>,
) {
  const newGames = games.filter(g => g.status === 'new');
  const testSkipCreate = TEST_MODE && newGames.length >= 3;
  const rankedStandardGames = newGames.filter(g => g.gameMode === '0' && !g.minRank);
  const minRankGames = newGames.filter(g => !!g.minRank);
  const maniaGames = newGames.filter(g => g.gameMode === '3');

  if (!DISABLE_AUTO_GAME_CREATION && !testSkipCreate) {
    // If no games are active, create a new one
    try {
      if (rankedStandardGames.length === 0) {
        logger.info('Creating a new game...');
        await createGame(getRecentMaps).catch(e =>
          logger.error('Failed to create game!', e),
        );
      }
      if (!DISABLE_LOWER_LVL_LOBBIES && minRankGames.length === 0) {
        logger.info('Creating a new game with a minimum rank...');
        await createGame(getRecentMaps, 45000).catch(e =>
          logger.error('Failed to create game!', e),
        );
      }
      if (!DISABLE_MANIA_LOBBIES && maniaGames.length === 0) {
        logger.info('Creating mania game');
        await createGame(getRecentMaps, undefined, undefined, '3').catch(e =>
          logger.error('Failed to create game!', e),
        );
      }
    } catch (e) {
      logger.error('Failed to create new games!', e);
    }
  }
}

async function openScheduledGame(game: IGame): Promise<boolean> {
  if (game.nextStageStarts && game.nextStageStarts < new Date()) {
    logger.info('Opening scheduled game...');
    game.nextStageStarts = undefined;
    game.status = 'new';
    await game.save();
    return true;
  } else {
    return false;
  }
}

async function startGame(game: IGame): Promise<boolean> {
  if (Date.now() - SERVER_START_DATE.getTime() > 30000) {
    await removeAfkPlayers(game);
  }

  const enoughPlayers = game.players.length >= PLAYERS_REQUIRED_TO_START;
  if (!enoughPlayers) {
    if (game.nextStageStarts) {
      logger.info('Canceling countdown.');
      game.nextStageStarts = undefined;
      await game.save();
      clearGetLobbyCache(game._id);
      return true;
    }

    return false;
  }

  if (!game.nextStageStarts) {
    logger.info('Beginning countdown...');
    // Set the countdown to start
    if (!FAST_FORWARD_MODE) {
      await setNextStageStartsAt(game, COUNTDOWN_START);
    } else {
      const date = new Date();
      date.setSeconds(date.getSeconds() + 120);
      game.nextStageStarts = date;
      await game.save();
    }
    return true;
  } else if (game.nextStageStarts < new Date()) {
    // Start the first round
    await nextRound(game);
    clearGetLobbyCache(game._id);
    return true;
  }

  return false;
}

async function checkRoundEnded(game: IGame): Promise<boolean> {
  // Check if next round should start
  if (<Date>game.nextStageStarts < new Date()) {
    logger.info(`(game id: ${game.id}) Round ${game.roundNumber} ended.`);
    const round = <IRound>await Round.findById(game.currentRound);
    await checkRoundScores(game, round, getUserRecent);
    await roundEnded(game, round);
    await updatePlayerAchievements(game);
    clearGetLobbyCache(game._id);
    await sendPlayersToSocket(game);
    return true;
  }

  return false;
}

async function completeRound(game: IGame) {
  const alivePlayers = game.players.filter(p => p.alive);

  if (<Date>game.nextStageStarts < new Date()) {
    if (game.roundNumber !== 10 && alivePlayers.length > 1) {
      // Start the next round
      await nextRound(game);
      clearGetLobbyCache(game._id);
    } else {
      // End the game
      await endGame(game);
      clearGetLobbyCache(game._id);
    }
    return true;
  }

  return false;
}

async function setNextStageStartsAt(game: IGame, seconds: number) {
  const date = new Date();
  date.setSeconds(date.getSeconds() + (FAST_FORWARD_MODE ? 1 : seconds));

  // Update game status and set time to next stage
  game.nextStageStarts = date;
  await game.save();
}

async function skipCheckingScore(game: IGame) {
  if (
    game.status === 'checking-scores' &&
    <Date>game.nextStageStarts < new Date()
  ) {
    const round = <IRound>await Round.findById(game.currentRound);
    logger.warn('Checking scores not complete after 2 minutes!', {
      gameId: game._id,
      round: round._id,
      playersAliveCount: game.players.filter(p => p.alive).length,
    });

    const scoresCount = await Score.countDocuments({ roundId: game._id });
    const alivePlayersCount = game.players.filter(p => p.alive).length;

    if (scoresCount >= alivePlayersCount / 2) {
      logger.info(
        `(game id: ${game._id.toHexString()}) Ending round as at least half alive players have set score.`,
      );
      await roundEnded(game, round);
      await updatePlayerAchievements(game);
    } else {
      logger.info(
        `(game id: ${game._id.toHexString()}) Checking scores again.`,
      );
      await checkRoundEnded(game);
    }
    clearGetLobbyCache(game._id);
    return true;
  }

  return false;
}

export function clearGetLobbyCache(gameId: string | ObjectId) {
  cache.del(`get-lobby-${gameId}`);
}

export function toggleAutoCreation() {
  DISABLE_AUTO_GAME_CREATION = !DISABLE_AUTO_GAME_CREATION;
}

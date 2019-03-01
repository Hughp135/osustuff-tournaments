import { IGame } from './../../models/Game.model';
import { getAllUserBestScores } from '../../game/get-round-scores';
import { Game } from '../../models/Game.model';
import { Request, Response } from 'express';
import { Round } from '../../models/Round.model';
import mongoose, { Types } from 'mongoose';
import { getDataOrCache } from '../../services/cache';
import { ObjectId } from 'bson';

export async function getLobby(req: Request, res: Response) {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).end();
  }

  const cacheKey = `get-lobby-${id}`;
  const data = await getDataOrCache(
    cacheKey,
    5000,
    async () => await await getGamePayload(id),
  );

  if (!data) {
    return res.status(404).end();
  }

  res.json(data);
}

export async function getGamePayload(gameId: string | Types.ObjectId) {
  if (!ObjectId.isValid(gameId)) {
    return null;
  }

  const game = await Game.findById(gameId)
    .select({
      title: 1,
      nextStageStarts: 1,
      roundNumber: 1,
      status: 1,
      createdAt: 1,
      currentRound: 1,
      currentRoundNumber: 1,
      players: 1,
      winningUser: 1,
      minRank: 1,
      maxRank: 1,
      owner: 1,
      description: 1,
    })
    .lean();

  if (!game) {
    return null;
  }

  const secondsToNextRound = game.nextStageStarts
    ? (game.nextStageStarts.getTime() - Date.now()) / 1000
    : undefined;
  const round = await Round.findById(game.currentRound)
    .select({ beatmap: 1 })
    .lean();
  const scores = await getScores(game);

  delete game.players; // players are obtained from separate request for performance

  return {
    ...game,
    round,
    secondsToNextRound,
    scores,
  };
}

async function getScores(game: IGame) {
  const scores = ['complete', 'round-over'].includes(game.status)
    ? await getAllUserBestScores(game.currentRound)
    : [];
  if (!game.players) {
    throw new Error('game has no players');
  }
  return scores.map((score: any) => {
    const player = game.players.find(
      (p: any) => p.userId.toString() === score.userId.toString(),
    );
    if (player) {
      score.username = player.username;
    }
    score.userId = undefined;

    return score;
  });
}

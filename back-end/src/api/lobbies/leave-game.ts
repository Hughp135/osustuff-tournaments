import { Request, Response } from 'express';
import { Game } from '../../models/Game.model';
import { JoinGameRequest } from '../../models/JoinGameRequest.model';
import { getUser } from '../../services/osu-api';

export async function leaveGame(req: Request, res: Response) {
  const { requestId } = req.body;

  const verifyRequest = await JoinGameRequest.findById(requestId);

  if (!verifyRequest) {
    return res.status(404).end();
  }

  const game = await Game.findById(req.params.id);

  if (!game) {
    return res.status(404).end();
  }

  const player = game.players.find(
    p => p.username.toLowerCase() === verifyRequest.username.toLowerCase(),
  );

  if (verifyRequest.verified) {
    await JoinGameRequest.deleteOne({ _id: verifyRequest.id });
  }

  res.status(200).end();
}

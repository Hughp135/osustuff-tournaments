import { Request, Response } from 'express';
import { Game } from '../../models/Game.model';
import { JoinGameRequest } from '../../models/JoinGameRequest.model';

export async function joinGame(req: Request, res: Response) {
  const game = await Game.findById(req.params.id);

  if (!game) {
    return res.status(404).end();
  }

  if (game.status !== 'new') {
    return res.status(400).end();
  }

  const expiryDate = new Date();
  expiryDate.setSeconds(expiryDate.getSeconds() + 60);

  await JoinGameRequest.deleteMany({
    username: req.body.username,
  });

  const joinRequest = await JoinGameRequest.create({
    username: req.body.username,
    gameId: game._id,
    expiresAt: expiryDate,
  });

  res.json({
    requestId: joinRequest._id,
  });
}

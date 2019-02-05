import { verifyJWT } from './jwt';
import { Request, Response } from 'express';

export async function authMiddleware(req: Request, res: Response, next: any) {
  try {
    const claim: any = await verifyJWT(req.cookies.jwt_token);

    req.app.set('claim', claim);

    return next();
  } catch (e) {
    res.status(401).json({
      error: 'You must be logged in.',
    });
  }
}

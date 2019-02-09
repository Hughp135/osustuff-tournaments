import { verifyJWT } from './jwt';
import { Request, Response } from 'express';

export async function authMiddleware(req: Request, res: Response, next: any) {
  try {
    if (req.cookies.jwt_token && req.cookies.jwt_token.length) {
      const claim: any = await verifyJWT(req.cookies.jwt_token);

      (<any> req).claim = claim;
    }

    return next();
  } catch (e) {
    res.status(401).json({
      error: 'You must be logged in.',
    });
  }
}

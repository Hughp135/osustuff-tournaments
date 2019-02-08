import jwt from 'jsonwebtoken';
import config from 'config';
import { logger } from '../../logger';

const JWT_SECRET: string = config.get('JWT_SECRET');

export function verifyJWT(token: string) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_SECRET, (err, decodedToken) => {
      if (err || !decodedToken) {
        /* istanbul ignore next */
        logger.info('Invalid token error', err.message || err);
        return reject(err);
      }

      resolve(decodedToken);
    });
  });
}

export function createJWT(data: any) {
  const token = jwt.sign(data, JWT_SECRET, { expiresIn: '30d' });
  return token;
}

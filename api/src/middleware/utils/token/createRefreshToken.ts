import { sign } from 'jsonwebtoken';
import { REFRESH_TOKEN_SECRET as secret } from './secret';

import type { Request, Response, NextFunction } from 'express';

/**
 * Creates a jwt refresh token valid for 7 days
 * and stores it on `res.locals.refreshToken`
 */
export default function createRefreshToken() {
  return (_req: Request, res: Response, next: NextFunction) => {
    res.locals.refreshToken = sign(
      {
        id: res.locals.user.id,
        sessionId: res.locals.user.sessionId,
      },
      secret,
      { expiresIn: '7d' }
    );

    return next();
  };
}

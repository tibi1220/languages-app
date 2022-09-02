import { sign } from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET as secret } from './secret';

import type { Request, Response, NextFunction } from 'express';

/**
 * Creates a jwt access token valid for 15 minutes
 * and stores it on `res.locals.accessToken`
 */
export default function createAccessToken() {
  return (_req: Request, res: Response, next: NextFunction) => {
    res.locals.accessToken = sign(
      {
        id: res.locals.user.id,
        username: res.locals.user.username,
      },
      secret,
      // TODO: remove 1000
      { expiresIn: 60 * 15 * 1000 }
    );

    return next();
  };
}

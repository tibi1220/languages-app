import type { Request, Response, NextFunction } from 'express';

/**
 * Sets the refreshToken stored on `res.locals.refreshToken` as an
 * http-only Cookie, valid for 7 days, then calls the next middleware
 */
export default function setRefreshToken() {
  return (_req: Request, res: Response, next: NextFunction) => {
    res.cookie('x-r-jwt', res.locals.refreshToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return next();
  };
}

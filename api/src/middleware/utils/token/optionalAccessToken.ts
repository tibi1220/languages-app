import { verify } from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET as secret } from './secret';

import type { Request, Response, NextFunction } from 'express';

/**
 * Checks if the accessToken sent in the request header is valid
 * If valid, it stores the payload on `res.locals.user`
 * If not, does nothing, calls the next middleware afterwards
 */
export default function optionalAccessToken() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Authorization: 'Bearer <token>'
    const token = req.headers.authorization?.split(' ')[1];
    res.locals.opts ||= {};
    res.locals.opts.optionalAuth = false;

    // If no token, do nothing
    if (!token) {
      return next();
    }

    // Try to verify token
    verify(token, secret, (err, payload) => {
      if (err) {
        return next();
      }

      // Valid token, set variables
      res.locals.user = payload;
      res.locals.opts.optionalAuth = true;
      res.locals.opts.isLoggedIn = true;
      return next();
    });
  };
}

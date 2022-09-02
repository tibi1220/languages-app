import { verify } from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET as secret } from './secret';

import type { Request, Response, NextFunction } from 'express';

/**
 * Checks if the AccessToken sent in the request header is valid
 * If valid, it stores the payload on `res.locals.user`
 * Calls the error handler otherwise
 */
export default function verifyAccessToken() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Authorization: 'Bearer <token>'
    const token = req.headers.authorization?.split(' ')[1];

    // If no token, return error
    if (!token) {
      return next({
        message: 'no access token provided',
        status: 400,
      });
    }

    // Try to verify token
    verify(token, secret, (err, payload) => {
      if (err) {
        return next({
          message: err.message,
          status: 403,
        });
      }

      res.locals.opts ||= {};
      res.locals.opts.isLoggedIn = true;
      res.locals.user = payload;
      return next();
    });
  };
}

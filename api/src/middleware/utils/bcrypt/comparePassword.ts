import { compare } from 'bcrypt';

import type { Request, Response, NextFunction } from 'express';

/**
 * Compares `req.body.password` with `res.locals.user.password`
 * If match, calls the next middleware
 * Calls the error handler otherwise
 */
export default function comparePassword() {
  return (req: Request, res: Response, next: NextFunction) => {
    compare(req.body.password, res.locals.user.password)
      .then(match => {
        if (match) {
          return next();
        }

        return next({
          message: 'incorrect password',
          status: 403,
        });
      })
      .catch(err => {
        console.error(err);
        return next({
          message: 'password hashing error',
          status: 500,
        });
      });
  };
}

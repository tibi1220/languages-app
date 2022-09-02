import { hash } from 'bcrypt';

import type { Request, Response, NextFunction } from 'express';

/**
 * Hashes `req.body.password` and stores the hashed password on `res.locals.hashed`
 * Calls the next middleware if success
 * Calls the error handler otherwise
 */
export default function hashPassword() {
  return (req: Request, res: Response, next: NextFunction) => {
    hash(req.body.password, 10)
      .then(hashed => {
        res.locals.hashed = hashed;
        return next();
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

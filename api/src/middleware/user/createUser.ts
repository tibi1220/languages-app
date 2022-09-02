import type { PrismaClient } from '@prisma/client';
import type { Request, Response, NextFunction } from 'express';

/**
 * Creates a User based on the request body parameters
 * `req.body.(email|username|password)`
 * Stores the newly created User on `res.locals.user` if success
 * Calls the error handler otherwise
 * @example
 * ```typescript
 * type res.locals.user = {
 *   id: number;
 *   email: string;
 *   username: string;
 *   createdAt: Date;
 * };
 * ```
 */
export default function createUser(prisma: PrismaClient) {
  return (req: Request, res: Response, next: NextFunction) => {
    prisma.user
      .create({
        data: {
          email: req.body.email,
          username: req.body.username,
          password: res.locals.hashed,
        },
        // Do not return password and sessionId, only the following:
        select: { id: true, username: true, email: true, createdAt: true },
      })
      .then(user => {
        res.locals.user = user;
        return next();
      })
      .catch(err => {
        console.error(err);
        return next({
          message: 'database error',
          status: 500,
        });
      });
  };
}

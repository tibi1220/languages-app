import type { PrismaClient } from '@prisma/client';
import type { Request, Response, NextFunction } from 'express';

/**
 * Gets the User with username `req.body.username` if exists
 * Saves the User on `res.locals.user` if success
 * Calls the error handler otherwise
 *
 * @example
 * ```typescript
 * type res.locals.user = {
 *   id: number;
 *   email: string;
 *   username: string;
 *   createdAt: Date;
 *   password: string;
 *   sessionId: number;
 * };
 * ```
 */
export default function getUserForLogin(prisma: PrismaClient) {
  return (req: Request, res: Response, next: NextFunction) => {
    prisma.user
      .findUnique({
        where: { username: req.body.username },
      })
      .then(user => {
        if (user === null) {
          return next({
            message: 'user does not exist',
            status: 400,
          });
        }

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

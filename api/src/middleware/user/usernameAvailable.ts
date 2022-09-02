import type { PrismaClient } from '@prisma/client';
import type { Request, Response, NextFunction } from 'express';

/**
 * Checks if the username is still available to use
 * Saves the User on `res.locals.user` if not available
 * Saves the status to `res.locals.message`
 *
 * @example
 * ```typescript
 * type res.locals.message = {
 *   isAvailable: boolean;
 * };
 * ```
 */
export default function usernameAvailable(prisma: PrismaClient) {
  return (_req: Request, res: Response, next: NextFunction) => {
    prisma.user
      .findFirst({
        where: {
          username: {
            equals: res.locals.user.username,
            mode: 'insensitive',
          },
        },
      })
      .then(user => {
        if (user === null) {
          res.locals.message = { isAvailable: true };
          return next();
        }

        res.locals.user = user;
        res.locals.message = { isAvailable: false };
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

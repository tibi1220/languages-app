import type { Request, Response, NextFunction } from 'express';
import type { PrismaClient } from '@prisma/client';

/**
 * Revokes all refresh tokens owned by the user
 * by incrementing one's sessionId in the DB
 * Stores the User on `res.locals.user` and
 * `{ success: true }` on `res.locals.message` if success
 * Calls the error handler otherwise
 */
export default function revokeTokens(prisma: PrismaClient) {
  return (_req: Request, res: Response, next: NextFunction) => {
    prisma.user
      .update({
        where: { id: res.locals.user.id },
        data: { sessionId: res.locals.user.sessionId + 1 },
      })
      .then(user => {
        res.locals.user = user;
        res.locals.message = { success: true };
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

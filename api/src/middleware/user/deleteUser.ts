import type { PrismaClient } from '@prisma/client';
import type { Request, Response, NextFunction } from 'express';

/**
 * Deletes the User with id `res.locals.user.id`
 * Stores the deleted User on `res.locals.user` and
 * `{ success: true }` on `res.locals.message` if success
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
export default function deleteUser(prisma: PrismaClient) {
  return (_req: Request, res: Response, next: NextFunction) => {
    prisma.user
      .delete({ where: { id: res.locals.user.id } })
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
